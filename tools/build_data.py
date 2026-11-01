"""Build data/exam-data.json from the official exam workbook (ผู้มีสิทธิ์สอบ6902.xlsx).

Source page: https://sites.google.com/a/mcu.ac.th/abhidham/สอบพระอภิธรรมภาค22569
Usage:  python tools/build_data.py [path/to/workbook.xlsx]

Sheets used
  แจ้งที่สอบอชว6902   central-campus candidates: seat no., ID, name, class, affiliation, room, building
  แจ้งที่สอบหน่วย6902  branch-unit candidates (one block per centre, numbered 1..N per centre)
  สถิติส่ง6902        per-centre statistics: province and exam-opening committee member
The timetable sheet is small and stable, so it is encoded by hand in app.js and
checked against the workbook below.
"""
import json
import re
import sys
import unicodedata
from collections import Counter, OrderedDict, defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tools" / "exam-6902-source.xlsx"
OUT = ROOT / "data" / "exam-data.json"

CLASSES = ["จูฬ-ตรี", "จูฬ-โท", "จูฬ-เอก", "มัชฌิม-ตรี", "มัชฌิม-โท", "มัชฌิม-เอก", "มหา-ตรี", "มหา-โท", "มหา-เอก"]

# Branch centres: key = the affiliation label used in the candidate sheet.
# stats = row number in the statistics sheet; en / provEn = English; map = Google Maps query.
CENTRES = [
    ("วัดกลาง", 1, "Wat Klang", "Suphan Buri", None),
    ("วัดเก่าโบราณ", 2, "Wat Kao Boran", "Chon Buri", None),
    ("วัดเขาพุทธโคดม", 3, "Wat Khao Phutthakhodom", "Chon Buri", None),
    ("วัดจากแดง", 4, "Wat Chak Daeng", "Samut Prakan", None),
    ("วัดเจริญธรรมาราม", 5, "Wat Charoen Thammaram", "Bangkok", None),
    ("วัดท่ามะโอ", 6, "Wat Tha Ma O", "Lampang", None),
    ("วัดนาพร้าวเก่า", 7, "Wat Na Phrao Kao", "Chon Buri", None),
    ("วัดป่าธรรมโสภณ", 8, "Wat Pa Thamma Sophon", "Lop Buri", None),
    ("วัดพรหมจริยาวาส", 9, "Wat Phrom Chariyawat", "Nakhon Sawan", None),
    ("วัดพระธาตุศรีจอมทองวรวิหาร", 10, "Wat Phra That Si Chom Thong Worawihan", "Chiang Mai", None),
    ("วัดมหาธาตุวรวิหาร", 11, "Wat Mahathat Worawihan", "Ratchaburi", None),
    ("วัดมเหยงคณ์", 12, "Wat Maheyong", "Phra Nakhon Si Ayutthaya", None),
    ("วัดเมืองมาง", 13, "Wat Mueang Mang", "Chiang Mai", None),
    ("วัดร่ำเปิง(ตโปทาราม)", 14, "Wat Ram Poeng (Tapotaram)", "Chiang Mai", None),
    ("วัดสระบัว", 15, "Wat Sa Bua", "Phetchaburi", None),
    ("วัดสว่างมีชัย", 16, "Wat Sawang Mi Chai", "Bueng Kan", None),
    ("วัดสามชุก", 17, "Wat Sam Chuk", "Suphan Buri", None),
    ("วัดสุวรรณประสิทธิ์", 18, "Wat Suwan Prasit", "Bangkok", None),
    ("วัดหาดใหญ่สิตาราม", 19, "Wat Hat Yai Sitaram", "Songkhla", None),
    ("วัดอุดมมงคล", 20, "Wat Udom Mongkhon", "Kanchanaburi", None),
    ("ศูนย์ปฏิบัติธรรมฯ", 21, "Khao Din Nong Saeng Dhamma Practice Centre", "Chanthaburi", None),
    ("ห้องเรียนฯกระทรวง กต.", 22, "Ministry of Foreign Affairs Classroom", "Bangkok", "กระทรวงการต่างประเทศ ถนนศรีอยุธยา"),
    ("ห้องเรียนฯวัดอรัญญิก", 23, "Wat Aranyik Classroom", "Phitsanulok", None),
    ("ห้องเรียนฯพุทธสมาคมฯ", 24, "Buddhist Association of Thailand Classroom", "Bangkok", "พุทธสมาคมแห่งประเทศไทย ถนนพระอาทิตย์"),
    ("ห้องเรียนฯยุวพุทธิกสมาคม", 25, "Young Buddhists Association Classroom", "Bangkok", "ยุวพุทธิกสมาคมแห่งประเทศไทย เพชรเกษม 54"),
    ("ห้องเรียนฯวัดเขาทุ่งวัว", 26, "Wat Khao Thung Wua Classroom", "Chon Buri", None),
    ("ห้องเรียนฯวัดจันทรสุข", 27, "Wat Chantharasuk Classroom", "Pathum Thani", None),
    ("ห้องเรียนฯวัดเจริญสมณกิจ", 28, "Wat Charoen Samanakit Classroom", "Phuket", None),
    ("ห้องเรียนฯวัดตึก", 29, "Wat Tuek Classroom", "Phra Nakhon Si Ayutthaya", None),
    ("ห้องเรียนฯวัดป่าวชิรบรรพต", 31, "Wat Pa Wachira Banphot Classroom", "Chon Buri", None),
    ("ห้องเรียนฯวัดผ่องพลอยวิริยาราม", 32, "Wat Phong Phloi Wiriyaram Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดพุทธบูชา", 33, "Wat Phutthabucha Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดเพลง(กลางสวน)", 34, "Wat Phleng (Klang Suan) Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดราชคฤห์วรวิหาร", 35, "Wat Ratchakhrue Worawihan Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดราชาธิวาสวิหาร", 36, "Wat Rachathiwat Wihan Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดวังหิน", 37, "Wat Wang Hin Classroom", "Phitsanulok", None),
    ("ห้องเรียนฯวัดวิหารธรรม", 38, "Wat Wihan Tham Classroom", "Udon Thani", None),
    ("ห้องเรียนฯวัดศิริพงษ์ธรรมนิมิต", 39, "Wat Siriphong Thammanimit Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดสามพระยา", 40, "Wat Sam Phraya Classroom", "Bangkok", None),
    ("ห้องเรียนฯวัดสุทธจินดาวรวิหาร", 41, "Wat Sutthachinda Worawihan Classroom", "Nakhon Ratchasima", None),
    ("ห้องเรียนฯพุทธสมาคมฯ(วัดหัวคู้)", 42, "Wat Hua Khu Buddhist Association Classroom", "Samut Prakan", None),
    ("วัดป่าชัยมงคล(สอบวัดอุบลวนาราม)", 43, "Wat Pa Chai Mongkhon — sits at Wat Ubon Wanaram", "Nonthaburi", "วัดอุบลวนาราม นนทบุรี"),
    ("ห้องเรียนฯส.พิศญาธรรมสถาน", 44, "Phitsaya Thammasathan Classroom", "Chiang Rai", None),
    ("ห้องเรียนฯส.สันตินิวาสหัวหิน", 45, "Santi Niwat Hua Hin Classroom", "Prachuap Khiri Khan", None),
    ("ห้องเรียนฯวัดนิสสรณะวนาราม", 46, "Wat Nissarana Wanaram Classroom", "Ang Thong", None),
    ("ห้องเรียนฯสำนักแม่ชีไทยศาลายา", 47, "Thai Nuns' Institute (Salaya) Classroom", "Nakhon Pathom", "สถาบันแม่ชีไทย ศาลายา"),
    ("ห้องเรียนฯอสธ.วัดยานนาวา", 48, "Wat Yannawa Classroom", "Bangkok", None),
]

# Affiliation labels that only appear in the central list (students who sit at the central campus).
EXTRA_AFFIL = {
    "อชว.มจร": ("อชว. มจร (ส่วนกลาง)", "Abhidhamma Jotika College (central)"),
    "หร.วธมร.ประเทศสวีเดน": ("ห้องเรียนฯ วธมร. ประเทศสวีเดน", "Classroom in Sweden (วธมร.)"),
    "ห้องเรียนฯวธมร.สวีเดน": ("ห้องเรียนฯ วธมร. ประเทศสวีเดน", "Classroom in Sweden (วธมร.)"),
    "หร.วธมร.": ("ห้องเรียนฯ วธมร. ประเทศสวีเดน", "Classroom in Sweden (วธมร.)"),
    "ห้องเรียนฯวัดธรรมามูลวรวิหาร": ("ห้องเรียนฯ วัดธรรมามูลวรวิหาร (ชัยนาท)", "Wat Thammamun Worawihan Classroom (Chai Nat)"),
}

ZW = re.compile(r"[​‌‍﻿]")


def clean(s):
    if s is None:
        return ""
    s = unicodedata.normalize("NFC", str(s)).replace("\xa0", " ")
    s = ZW.sub("", s)
    s = s.replace("ํา", "ำ")  # decomposed sara am
    return re.sub(r"\s+", " ", s).strip()


def key(s):
    return re.sub(r"[\s.]", "", clean(s)).rstrip(".")


def clean_id(v):
    s = clean(v)
    if s in ("", "0"):
        return ""
    return s  # keep notes such as 'นักศึกษาใหม่' / 'ขอทำบัตรใหม่' and short codes like '0283'


def main():
    wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)

    # ---------- statistics sheet ----------
    stats = {}
    for r in wb["สถิติส่ง6902"].iter_rows(values_only=True):
        if isinstance(r[0], int):
            stats[r[0]] = {"nameTh": clean(r[1]), "provTh": clean(r[2]),
                           "counts": [int(x or 0) for x in r[3:12]], "total": int(r[12] or 0),
                           "committee": clean(r[13])}

    # ---------- centres ----------
    centres = OrderedDict()
    centres["central"] = {
        "id": "central", "th": "อภิธรรมโชติกะวิทยาลัย (ส่วนกลาง)", "en": "Abhidhamma Jotika College (central campus)",
        "provTh": "กรุงเทพมหานคร", "provEn": "Bangkok",
        "addrTh": "วัดมหาธาตุยุวราชรังสฤษฎิ์ ท่าพระจันทร์ เขตพระนคร กรุงเทพมหานคร",
        "map": "วัดมหาธาตุยุวราชรังสฤษฎิ์ ท่าพระจันทร์", "committee": "", "statsTotal": stats[49]["total"],
    }
    by_key = {}
    for i, (label, sno, en, prov_en, mapq) in enumerate(CENTRES, 1):
        st = stats[sno]
        cid = f"c{i:02d}"
        centres[cid] = {"id": cid, "th": st["nameTh"], "label": label, "en": en, "provTh": st["provTh"],
                        "provEn": prov_en, "addrTh": "", "map": mapq, "committee": st["committee"],
                        "statsTotal": st["total"]}
        by_key[key(label)] = cid
    # stats row 30 (วัดธรรมามูล) has no own list: its students sit centrally.

    # ---------- affiliations ----------
    affils = OrderedDict()  # key -> [th, en, centreId|None]

    def affil_id(raw):
        k = key(raw)
        if k not in affils:
            if k in by_key:
                c = centres[by_key[k]]
                affils[k] = [c["th"], c["en"], c["id"]]
            else:
                ek = next((e for e in EXTRA_AFFIL if key(e) == k), None)
                if ek is None:
                    raise SystemExit(f"Unknown affiliation label: {raw!r} (key {k!r})")
                affils[k] = [*EXTRA_AFFIL[ek], None]
        return list(affils).index(k)

    rooms = OrderedDict()  # (venue, room, building) -> idx
    students = []

    def room_id(venue, room, bld):
        k = (venue, room, bld)
        if k not in rooms:
            rooms[k] = len(rooms)
        return rooms[k]

    # ---------- central list ----------
    for r in wb["แจ้งที่สอบอชว6902"].iter_rows(values_only=True):
        if not isinstance(r[0], int):
            continue
        seat, sid, name, cls, aff, room, bld = r[:7]
        cls = clean(cls)
        assert cls in CLASSES, cls
        students.append([seat, clean_id(sid), clean(name), CLASSES.index(cls), "central",
                         room_id("central", clean(room), clean(bld)), affil_id(aff)])

    # ---------- branch list ----------
    header = None
    headers = {}
    for r in wb["แจ้งที่สอบหน่วย6902"].iter_rows(values_only=True):
        if isinstance(r[0], int):
            seat, sid, name, cls, room, bld, aff = r[:7]
            cls = clean(cls)
            assert cls in CLASSES, cls
            cid = by_key[key(aff)]
            headers.setdefault(cid, header)
            room, bld = clean(room), clean(bld)
            # Most centres repeat their own name in the room/place columns -> no specific room.
            # Wat Phutthabucha lists the building in the 'room' column and the room in the 'place' column.
            if key(room) == key(aff) and key(bld) == key(aff):
                rm, bd = "", ""
            else:
                rm, bd = bld, room
            students.append([seat, clean_id(sid), clean(name), CLASSES.index(cls), cid,
                             room_id(cid, rm, bd), affil_id(aff)])
        elif r[0] and clean(r[0]) != "เลขที่":
            header = clean(r[0])

    for cid, h in headers.items():
        addr = re.sub(r"^(หน่วยบริการฯ|ห้องเรียนฯ)\s*", "", h)
        centres[cid]["addrTh"] = addr
        if not centres[cid]["map"]:
            centres[cid]["map"] = addr

    # ---------- room summaries ----------
    room_list = []
    seats = defaultdict(list)
    for s in students:
        seats[(s[5], s[3])].append(s[0])
    for (venue, room, bld), idx in rooms.items():
        room_list.append({"venue": venue, "room": room, "bld": bld})
    room_alloc = []  # per (room, class): seat range
    for (ridx, cls), v in seats.items():
        room_alloc.append({"r": ridx, "c": cls, "from": min(v), "to": max(v), "n": len(v)})
    room_alloc.sort(key=lambda a: (room_list[a["r"]]["venue"], a["c"], a["from"]))

    # ---------- per-centre counts from the lists ----------
    for c in centres.values():
        cnt = [0] * len(CLASSES)
        for s in students:
            if s[4] == c["id"]:
                cnt[s[3]] += 1
        c["counts"] = cnt
        c["total"] = sum(cnt)

    # ---------- data-quality flags ----------
    # 1 = same person (ID+name) listed at two different venues; 2 = ID shared by different names
    flags = [0] * len(students)
    by_sid = defaultdict(list)
    for i, s in enumerate(students):
        if s[1] and s[1].isdigit():
            by_sid[s[1]].append(i)
    for idxs in by_sid.values():
        if len(idxs) < 2:
            continue
        names = {key(students[i][2]) for i in idxs}
        venues = {students[i][4] for i in idxs}
        for i in idxs:
            if len(names) == 1 and len(venues) > 1:
                flags[i] |= 1
            elif len(names) > 1:
                flags[i] |= 2
    for i, f in enumerate(flags):
        students[i].append(f)

    data = {
        "meta": {
            "term": "2/2569", "built": "2026-11-01",
            "source": "https://sites.google.com/a/mcu.ac.th/abhidham/%E0%B8%AA%E0%B8%AD%E0%B8%9A%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%AD%E0%B8%A0%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%A0%E0%B8%B2%E0%B8%8422569",
            "files": {
                "list": "https://drive.google.com/file/d/1BMeaMT3GddSSkaWxAIc-tzh88G5KMefR/view",
                "schedule": "https://drive.google.com/file/d/1i_xnmw-L7lpsY7IgGfgwV22I6qRSRLOi/view",
                "stats": "https://drive.google.com/file/d/1gqET4XlHggW8F4bKHs2T0kdbcelVtnfi/view",
                "central": "https://drive.google.com/file/d/1FXlg8zKd4nllMyXKjsnlGKkQ-q8i41Rh/view",
                "branches": "https://drive.google.com/file/d/1gjfy2hukYpVBmLvScLkldN-793NYfDF-/view",
            },
            "statsGrandTotal": 3691,
        },
        "classes": CLASSES,
        "centres": list(centres.values()),
        "affils": [v for v in affils.values()],
        "rooms": room_list,
        "alloc": room_alloc,
        # [seat, studentId, name, classIdx, venueId, roomIdx, affilIdx, flags]
        "students": students,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # ---------- report ----------
    sys.stdout.reconfigure(encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
    print("students", len(students), "central", sum(1 for s in students if s[4] == "central"))
    print("rooms", len(room_list), "centres", len(centres), "affils", len(affils))
    print("flags", Counter(flags))
    for c in centres.values():
        if c["total"] != c["statsTotal"]:
            print(f"  list/stats differ: {c['th']}: list {c['total']} vs stats {c['statsTotal']}")
    missing = [c["id"] for c in centres.values() if not c["addrTh"]]
    print("centres without address:", missing)


if __name__ == "__main__":
    main()
