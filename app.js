/* Abhidhamma exam guide — semester 2/2569 (Nov 2026). Unofficial helper; data from the official lists. */
'use strict';
(() => {
  // ---------------------------------------------------------------- helpers
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const fmtN = (n) => Number(n).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US');
  const STORE = 'abh6902.';
  const store = {
    get: (k) => { try { return localStorage.getItem(STORE + k); } catch { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(STORE + k) : localStorage.setItem(STORE + k, v); } catch { /* private mode */ } },
  };

  // ---------------------------------------------------------------- static exam facts (from ตารางสอบ6902)
  const CLASS_INFO = [
    { th: 'จูฬอาภิธรรมิกะตรี', short: 'จูฬ-ตรี', en: 'Cūḷa-ābhidhammika Tri', enShort: 'Cūḷa-Tri', lvl: 0, yr: 1 },
    { th: 'จูฬอาภิธรรมิกะโท', short: 'จูฬ-โท', en: 'Cūḷa-ābhidhammika Do', enShort: 'Cūḷa-Do', lvl: 0, yr: 2 },
    { th: 'จูฬอาภิธรรมิกะเอก', short: 'จูฬ-เอก', en: 'Cūḷa-ābhidhammika Eka', enShort: 'Cūḷa-Eka', lvl: 0, yr: 3 },
    { th: 'มัชฌิมอาภิธรรมิกะตรี', short: 'มัชฌิม-ตรี', en: 'Majjhima-ābhidhammika Tri', enShort: 'Majjhima-Tri', lvl: 1, yr: 1 },
    { th: 'มัชฌิมอาภิธรรมิกะโท', short: 'มัชฌิม-โท', en: 'Majjhima-ābhidhammika Do', enShort: 'Majjhima-Do', lvl: 1, yr: 2 },
    { th: 'มัชฌิมอาภิธรรมิกะเอก', short: 'มัชฌิม-เอก', en: 'Majjhima-ābhidhammika Eka', enShort: 'Majjhima-Eka', lvl: 1, yr: 3 },
    { th: 'มหาอาภิธรรมิกะตรี', short: 'มหา-ตรี', en: 'Mahā-ābhidhammika Tri', enShort: 'Mahā-Tri', lvl: 2, yr: 1 },
    { th: 'มหาอาภิธรรมิกะโท', short: 'มหา-โท', en: 'Mahā-ābhidhammika Do', enShort: 'Mahā-Do', lvl: 2, yr: 2 },
    { th: 'มหาอาภิธรรมิกะเอก', short: 'มหา-เอก', en: 'Mahā-ābhidhammika Eka', enShort: 'Mahā-Eka', lvl: 2, yr: 3 },
  ];
  const DAYS = [
    { iso: '2026-11-20', n: 20, th: 'ศุกร์', en: 'Fri', thFull: 'วันศุกร์ที่ 20 พฤศจิกายน 2569', enFull: 'Friday, 20 November 2026' },
    { iso: '2026-11-21', n: 21, th: 'เสาร์', en: 'Sat', thFull: 'วันเสาร์ที่ 21 พฤศจิกายน 2569', enFull: 'Saturday, 21 November 2026' },
    { iso: '2026-11-22', n: 22, th: 'อาทิตย์', en: 'Sun', thFull: 'วันอาทิตย์ที่ 22 พฤศจิกายน 2569', enFull: 'Sunday, 22 November 2026' },
  ];
  const W = (q) => ({ s: '13:00', e: '17:00', k: 'w', q });
  const PLAN = {
    cula: [null, W(10), { s: '13:00', e: '17:00', k: 'o', q: 5 }],
    std: [W(7), W(7), { s: '13:00', e: '17:00', k: 'o', q: 6 }],
    mahaek: [W(7), W(7), { s: '09:00', e: '11:00', k: 'o', q: 6, note: 'mahaekNote' }],
  };
  const planOf = (c) => PLAN[c <= 2 ? 'cula' : c === 8 ? 'mahaek' : 'std'];

  // ---------------------------------------------------------------- i18n
  const T = {
    th: {
      skip: 'ข้ามไปยังเนื้อหา',
      appTitle: 'คู่มือสอบพระอภิธรรม', appSub: 'ภาคการศึกษาที่ 2/2569 · สอบ 20–22 พ.ย. 2569',
      navFind: 'ค้นหาที่นั่ง', navSchedule: 'ตารางสอบ', navVenues: 'สถานที่สอบ', navInfo: 'ข้อมูล',
      findTitle: 'ค้นหาห้องสอบและเลขที่นั่งสอบ',
      findHelp: 'พิมพ์ชื่อ ฉายา นามสกุล หรือรหัสนักศึกษา ไม่ต้องพิมพ์คำนำหน้า',
      searchLabel: 'ชื่อหรือรหัสนักศึกษา', searchPh: 'เช่น สมชาย หรือ 6980301761',
      filterClass: 'ชั้น', filterVenue: 'สถานที่สอบ', allClasses: 'ทุกชั้น', allVenues: 'ทุกสถานที่สอบ',
      resCount: 'พบ {n} รายการ', resMore: 'แสดง {shown} จาก {n} รายการ พิมพ์เพิ่มเพื่อให้แคบลง',
      resApprox: 'ไม่พบชื่อที่สะกดตรงกัน จึงแสดงชื่อที่ใกล้เคียง (ไม่นับวรรณยุกต์และสระ)',
      noRes: 'ไม่พบรายชื่อ',
      noResHelp: 'ลองพิมพ์เฉพาะชื่อหรือนามสกุล ตรวจตัวสะกด หรือค้นด้วยรหัสนักศึกษา หากยังไม่พบ โปรดติดต่อหน่วยบริการฯ ของท่านหรืออภิธรรมโชติกะวิทยาลัย',
      tooShort: 'พิมพ์อย่างน้อย 2 ตัวอักษร',
      seatNo: 'เลขที่นั่งสอบ', seatShort: 'เลขที่', room: 'ห้องสอบ', building: 'อาคาร / ชั้น', venue: 'สถานที่สอบ',
      province: 'จังหวัด', klass: 'ชั้น', sid: 'รหัสนักศึกษา', noId: 'ไม่มีรหัสในบัญชี', affil: 'สังกัด',
      roomTba: 'ยังไม่ระบุห้อง',
      roomTbaHelp: 'บัญชีรายชื่อระบุสถานที่สอบเป็น "ตึก มจร" แต่ยังไม่ระบุห้อง โปรดดูประกาศที่ตึกในวันสอบ หรือสอบถามเจ้าหน้าที่',
      atCentre: 'ณ สำนักของท่าน', atCentreSub: 'สอบที่หน่วยบริการฯ / ห้องเรียนฯ ที่ท่านสังกัด',
      mySchedule: 'ตารางสอบของท่าน', noExam: 'ไม่มีสอบ',
      wShort: 'ข้อเขียน {q} ข้อ', oShort: 'สัมภาษณ์ {q} ข้อ', written: 'สอบข้อเขียน', oral: 'สอบสัมภาษณ์', qn: '{q} ข้อ', timeUnit: 'น.',
      mahaekNote: 'สอบที่ตึก อชว. ภาคเช้า เสร็จแล้วประชุมคัดเลือกกรรมการบริหารอภิธรรมบัณฑิตรุ่นที่ 63/2569',
      seatsInRoom: 'เลขที่นั่งของชั้น{cls}ในห้องนี้',
      seatsNote: 'เรียงตามบัญชีรายชื่อ ไม่ใช่ผังห้องจริง',
      seatsRange: 'ท่านอยู่ลำดับที่ {pos} จาก {n} คน ของ{where}',
      thisCentre: 'สถานที่สอบนี้',
      sharedRoom: 'ห้องนี้ใช้สอบร่วมกับชั้น {list}',
      alsoListed: 'ชื่อของท่านยังปรากฏในบัญชีต่อไปนี้ด้วย',
      flagDup: 'ชื่อและรหัสนี้ปรากฏในบัญชีของมากกว่าหนึ่งสถานที่สอบ โปรดสอบถามหน่วยบริการฯ ของท่านว่าต้องสอบที่ใด',
      flagSharedId: 'รหัสนักศึกษานี้ปรากฏกับชื่ออื่นในบัญชีด้วย (อาจพิมพ์รหัสผิดในต้นฉบับ) โปรดยืนยันตัวตนด้วยชื่อ-นามสกุล',
      save: 'บันทึกเป็นบัตรของฉัน', saved: 'บันทึกแล้ว', addCal: 'เพิ่มลงปฏิทิน', directions: 'นำทาง', share: 'แชร์',
      savedToast: 'บันทึกไว้ในเครื่องนี้แล้ว จะแสดงทุกครั้งที่เปิดแอป', unsavedToast: 'ยกเลิกการบันทึกแล้ว', copied: 'คัดลอกข้อมูลแล้ว',
      calToast: 'ดาวน์โหลดไฟล์ปฏิทิน (.ics) แล้ว',
      myTicket: 'บัตรเข้าสอบของฉัน', back: 'กลับไปผลการค้นหา',
      phTitle: 'บัตรเข้าสอบจะแสดงที่นี่',
      phSteps: '<li>พิมพ์ชื่อหรือรหัสนักศึกษาในช่องค้นหา</li><li>แตะชื่อของท่านในผลการค้นหา</li><li>ดูเลขที่นั่ง ห้องสอบ และตารางสอบ แล้วกด “บันทึก” ไว้ใช้วันสอบ</li>',
      cdUnit: 'วัน', cdBefore: 'อีก {n} วันถึงวันสอบ', cdBeforeSub: 'สอบวันศุกร์ที่ 20 – วันอาทิตย์ที่ 22 พฤศจิกายน 2569',
      cdTomorrow: 'พรุ่งนี้เริ่มสอบแล้ว', cdToday: 'วันนี้เป็นวันสอบ วันที่ {k} จาก 3', cdTodayNone: 'วันนี้ไม่มีสอบสำหรับชั้นของท่าน',
      cdAfter: 'การสอบภาคนี้เสร็จสิ้นแล้ว', cdAfterSub: 'โปรดติดตามประกาศผลสอบจากอภิธรรมโชติกะวิทยาลัย',
      cdMine: '{cls}: เริ่มสอบ{day} เวลา {time} น.', cdTodayMine: '{cls}: {what} เวลา {time} น.',
      schedTitle: 'ตารางสอบ', schedSub: 'สอบวันศุกร์ที่ 20 – วันอาทิตย์ที่ 22 พฤศจิกายน 2569',
      schedMatrix: 'ตารางรวมทุกชั้น', allChip: 'ทุกชั้น', classCol: 'ชั้น', classes: 'ชั้น',
      notesTitle: 'หมายเหตุจากตารางสอบ',
      notes: [
        'ส่วนกลาง สอบที่ตึกมหาธาตุวิทยาลัย (มธ.) และชั้นมหา-เอก สอบที่ตึกอภิธรรมโชติกะวิทยาลัย (อชว.) — ห้องของแต่ละคนให้ดูจากบัญชีรายชื่อ (เมนู “ค้นหาที่นั่ง”)',
        'หน่วยบริการฯ / ห้องเรียนฯ: ชั้นจูฬ-ตรี ถึงมหา-โท สอบที่สำนักของตน',
        'ชั้นมหา-เอก ทุกหน่วยสอบรวมที่ส่วนกลาง สอบสัมภาษณ์ที่ตึก อชว. วันอาทิตย์ที่ 22 เวลา 09.00–11.00 น. เสร็จแล้วประชุมคัดเลือกกรรมการบริหารอภิธรรมบัณฑิตรุ่นที่ 63/2569',
        'ชั้นจูฬ (ตรี โท เอก) ไม่มีสอบในวันศุกร์ที่ 20',
      ],
      venTitle: 'สถานที่สอบและห้องสอบ',
      venSub: 'ส่วนกลางสอบที่วัดมหาธาตุฯ ท่าพระจันทร์ · หน่วยบริการฯ / ห้องเรียนฯ สอบที่สำนักของตน',
      segCentral: 'ส่วนกลาง', segBranch: 'หน่วยบริการฯ / ห้องเรียนฯ',
      roomFinder: 'หาห้องจากเลขที่นั่ง', roomFinderHelp: 'ทราบเลขที่นั่งแล้ว? เลือกชั้นแล้วใส่เลขที่ เพื่อดูห้องสอบ (เฉพาะส่วนกลาง)',
      rfNone: 'ไม่พบเลขที่ {seat} ในชั้น{cls} (ส่วนกลาง)', rfGo: 'ห้องสอบของเลขที่ {seat}',
      centralRooms: 'ห้องสอบส่วนกลาง', centralRoomsSub: 'วัดมหาธาตุยุวราชรังสฤษฎิ์ ท่าพระจันทร์ กรุงเทพฯ',
      people: '{n} คน', seatsFT: 'เลขที่ {a}–{b}',
      legend: [['มธ.', 'ตึกมหาธาตุวิทยาลัย'], ['อชว.', 'ตึกอภิธรรมโชติกะวิทยาลัย'], ['มจร', 'ตึก มจร (มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย)']],
      centreSearch: 'ค้นหาหน่วยบริการ', centrePh: 'ค้นหาชื่อวัด / ห้องเรียน หรือจังหวัด',
      centreCount: '{n} แห่ง · ผู้เข้าสอบรวม {p} คน', committee: 'กรรมการเปิดสอบ', candidates: 'ผู้เข้าสอบ',
      thammamun: 'ห้องเรียนฯ วัดธรรมามูลวรวิหาร (ชัยนาท) สอบร่วมที่ส่วนกลาง (อชว. มจร)',
      mapNote: 'ลิงก์นำทางค้นหาจากที่อยู่ในบัญชีรายชื่อ โปรดตรวจสอบตำแหน่งก่อนเดินทาง',
      // info
      howTitle: 'วิธีใช้งาน',
      how: ['ไปที่ “ค้นหาที่นั่ง” แล้วพิมพ์ชื่อ นามสกุล หรือรหัสนักศึกษา', 'แตะชื่อของท่าน เพื่อดูเลขที่นั่ง ห้องสอบ อาคาร และตารางสอบเฉพาะชั้นของท่าน', 'กด “บันทึกเป็นบัตรของฉัน” แอปจะจำไว้ในเครื่อง และแสดงบนหน้าแรกทุกครั้ง', 'กด “เพิ่มลงปฏิทิน” เพื่อให้โทรศัพท์เตือนก่อนเวลาสอบ และ “นำทาง” เพื่อเปิดแผนที่'],
      glossTitle: 'ชั้นเรียนพระอภิธรรม',
      glossLead: 'หลักสูตร 9 ชั้น แบ่งเป็น 3 ระดับ ระดับละ 3 ชั้น (ตรี → โท → เอก)',
      lvlNames: ['จูฬอาภิธรรมิกะ (ชั้นต้น)', 'มัชฌิมอาภิธรรมิกะ (ชั้นกลาง)', 'มหาอาภิธรรมิกะ (ชั้นสูง)'],
      lvlNotes: ['', 'ชั้นเอก: หลักสูตรประกาศนียบัตรมัชฌิมอาภิธรรมิกะเอก (ป.มอ.)', 'ชั้นเอก: หลักสูตรปริญญาบัตรอภิธรรมบัณฑิต (ป.อบ.) รุ่นที่ 63/2569'],
      faqTitle: 'คำถามที่พบบ่อย',
      faq: [
        ['ค้นหาชื่อไม่พบ ทำอย่างไร?', 'พิมพ์เฉพาะชื่อ หรือเฉพาะนามสกุล โดยไม่ต้องใส่คำนำหน้า (พระ นาย นาง แม่ชี ฯลฯ) ระบบไม่สนใจช่องว่างและพินทุ หากยังไม่พบจะแสดงชื่อที่สะกดใกล้เคียงให้ ผู้สมัครใหม่บางรายไม่มีรหัสนักศึกษาในบัญชี จึงต้องค้นด้วยชื่อ หากไม่พบจริง ๆ โปรดติดต่อหน่วยบริการฯ ของท่าน'],
        ['“เลขที่นั่งสอบ” คืออะไร?', 'คือเลขที่ตามบัญชีรายชื่อผู้เข้าสอบ ส่วนกลางนับแยกตามชั้น (แต่ละห้องรับช่วงเลขที่ต่อกัน) ส่วนหน่วยบริการฯ นับต่อเนื่องทั้งสำนัก ตารางเลขที่ในแอปเรียงตามบัญชี ไม่ใช่ผังที่นั่งจริงในห้อง'],
        ['ทำไมไม่มีหมายเลขห้อง?', 'ชั้นจูฬ-โท และจูฬ-เอก ส่วนกลาง บัญชีระบุเพียง “ตึก มจร” ยังไม่ระบุห้อง ส่วนหน่วยบริการฯ ส่วนใหญ่สอบที่สำนักของตนโดยไม่ระบุห้อง โปรดดูประกาศในวันสอบ'],
        ['ชื่อของฉันปรากฏสองแห่ง', 'มีผู้สมัครบางรายที่มีชื่ออยู่ทั้งในบัญชีส่วนกลางและบัญชีหน่วยบริการฯ หรือสมัครสอบสองชั้น แอปจะแสดงทุกรายการพร้อมคำเตือน โปรดยืนยันกับหน่วยบริการฯ ว่าต้องสอบที่ใด'],
        ['ข้อมูลของฉันถูกส่งไปที่ใดหรือไม่?', 'ไม่ การค้นหาทำงานในเครื่องของท่านทั้งหมด และ “บัตรของฉัน” บันทึกไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น'],
      ],
      statsTitle: 'สถิติผู้สมัครสอบ', statsLead: 'ตามเอกสารสถิติผู้เข้าสอบ ภาค 2/2569',
      statsCentral: 'ส่วนกลาง', statsBranch: 'หน่วยบริการฯ', statsTotal: 'รวม',
      statsFoot: 'บัญชีรายชื่อในแอปมี {n} รายการ (บางรายสมัครสองชั้นหรือมีชื่อซ้ำ) ส่วนเอกสารสถิติรวม {s} คน',
      srcTitle: 'เอกสารต้นฉบับ',
      src: [['page', 'หน้าประกาศ สอบพระอภิธรรมภาค 2/2569'], ['schedule', 'ตารางสอบ 6902 (PDF)'], ['central', 'บัญชีที่นั่งสอบ ส่วนกลาง อชว. (PDF)'], ['branches', 'บัญชีที่นั่งสอบ หน่วยบริการฯ (PDF)'], ['stats', 'สถิติผู้เข้าสอบ (PDF)'], ['list', 'ผู้มีสิทธิ์สอบ 6902 (Excel)']],
      disclaimer: 'แอปนี้ไม่ใช่ช่องทางทางการของอภิธรรมโชติกะวิทยาลัย จัดทำขึ้นเพื่อช่วยนักศึกษาค้นหาข้อมูลจากเอกสารที่เผยแพร่ ณ วันที่ 1 พฤศจิกายน 2569 หากข้อมูลไม่ตรงกัน ให้ยึดประกาศของวิทยาลัยและสถานที่สอบเป็นหลัก',
      loadErr: 'โหลดข้อมูลไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่อแล้วลองใหม่',
      shareText: '{name}\n{cls} · เลขที่นั่งสอบ {seat}\nห้องสอบ: {room}\nสถานที่สอบ: {venue}\nสอบ 20–22 พ.ย. 2569',
      dayShort: (d) => `${d.th} ${d.n} พ.ย.`,
    },
    en: {
      skip: 'Skip to content',
      appTitle: 'Abhidhamma Exam Guide', appSub: 'Semester 2/2569 · Exams 20–22 Nov 2026',
      navFind: 'Find seat', navSchedule: 'Schedule', navVenues: 'Venues', navInfo: 'Info',
      findTitle: 'Find your exam room and seat',
      findHelp: 'Type your name, monastic name, surname or student ID. Leave out titles such as Phra or Mr.',
      searchLabel: 'Name or student ID', searchPh: 'e.g. สมชาย or 6980301761',
      filterClass: 'Class', filterVenue: 'Exam venue', allClasses: 'All classes', allVenues: 'All venues',
      resCount: '{n} found', resMore: 'Showing {shown} of {n}. Type more to narrow it down.',
      resApprox: 'No exact spelling match. Showing close matches (ignoring tone marks and vowels).',
      noRes: 'No candidate found',
      noResHelp: 'Try only your first name or surname, check the spelling, or search by student ID. If you still cannot find yourself, contact your centre or Abhidhamma Jotika College.',
      tooShort: 'Type at least 2 characters',
      seatNo: 'Seat No.', seatShort: 'Seat', room: 'Exam room', building: 'Building / floor', venue: 'Exam venue',
      province: 'Province', klass: 'Class', sid: 'Student ID', noId: 'No ID in the list', affil: 'Affiliation',
      roomTba: 'Room not listed',
      roomTbaHelp: 'The list only says “ตึก มจร” (MCU Building) and gives no room. Check the notice at the building on exam day or ask the staff.',
      atCentre: 'At your centre', atCentreSub: 'You sit the exam at the branch centre / classroom you belong to',
      mySchedule: 'Your exam schedule', noExam: 'No exam',
      wShort: 'Written · {q} Q', oShort: 'Oral · {q} Q', written: 'Written exam', oral: 'Oral exam (interview)', qn: '{q} questions', timeUnit: '',
      mahaekNote: 'Held at the อชว. building in the morning, followed by the meeting to select the Abhidhamma Bandit class 63/2569 executive committee',
      seatsInRoom: 'Seat numbers for {cls} in this room',
      seatsNote: 'List order, not the physical room layout',
      seatsRange: 'You are no. {pos} of {n} at {where}',
      thisCentre: 'this venue',
      sharedRoom: 'This room is shared with {list}',
      alsoListed: 'Your name also appears in these listings',
      flagDup: 'This name and ID appear in the lists of more than one venue. Please ask your centre which one applies to you.',
      flagSharedId: 'This student ID also appears with a different name (probably a typo in the source list). Confirm by your full name.',
      save: 'Save as my ticket', saved: 'Saved', addCal: 'Add to calendar', directions: 'Directions', share: 'Share',
      savedToast: 'Saved on this device. It will show every time you open the app.', unsavedToast: 'Removed from this device', copied: 'Details copied',
      calToast: 'Calendar file (.ics) downloaded',
      myTicket: 'My exam ticket', back: 'Back to results',
      phTitle: 'Your exam ticket will appear here',
      phSteps: '<li>Type your name or student ID in the search box</li><li>Tap your name in the results</li><li>Check your seat, room and schedule, then tap “Save” for exam day</li>',
      cdUnit: 'days', cdBefore: '{n} days until the exams', cdBeforeSub: 'Friday 20 – Sunday 22 November 2026',
      cdTomorrow: 'Exams start tomorrow', cdToday: 'Exam day {k} of 3', cdTodayNone: 'No exam for your class today',
      cdAfter: 'This exam period has ended', cdAfterSub: 'Watch for the results announcement from Abhidhamma Jotika College',
      cdMine: '{cls}: first exam {day} at {time}', cdTodayMine: '{cls}: {what} at {time}',
      schedTitle: 'Exam schedule', schedSub: 'Friday 20 – Sunday 22 November 2026 (B.E. 2569)',
      schedMatrix: 'All classes at a glance', allChip: 'All classes', classCol: 'Class', classes: 'Classes',
      notesTitle: 'Notes from the official timetable',
      notes: [
        'Central campus: exams are held in the Mahathat Witthayalai building (มธ.); Mahā-Eka sits in the Abhidhamma Jotika College building (อชว.). Your own room is in the seating list (see “Find seat”).',
        'Branch centres / classrooms: Cūḷa-Tri up to Mahā-Do sit at their own centre.',
        'Mahā-Eka candidates from every centre sit centrally. The oral exam is in the อชว. building on Sunday 22, 09:00–11:00, followed by the meeting to select the Abhidhamma Bandit class 63/2569 executive committee.',
        'Cūḷa classes (Tri, Do, Eka) have no exam on Friday 20.',
      ],
      venTitle: 'Exam venues and rooms',
      venSub: 'Central campus at Wat Mahathat, Tha Phra Chan · Branch centres sit at their own location',
      segCentral: 'Central campus', segBranch: 'Branch centres',
      roomFinder: 'Find a room from a seat number', roomFinderHelp: 'Already know your seat number? Pick your class and enter it to see the room (central campus only).',
      rfNone: 'Seat {seat} is not in the {cls} central list', rfGo: 'Room for seat {seat}',
      centralRooms: 'Central campus rooms', centralRoomsSub: 'Wat Mahathat Yuwaratrangsarit, Tha Phra Chan, Bangkok',
      people: '{n} people', seatsFT: 'Seats {a}–{b}',
      legend: [['มธ.', 'Mahathat Witthayalai building'], ['อชว.', 'Abhidhamma Jotika College building'], ['มจร', 'MCU (Mahachulalongkornrajavidyalaya University) building']],
      centreSearch: 'Search centres', centrePh: 'Search by temple, classroom or province',
      centreCount: '{n} centres · {p} candidates', committee: 'Exam committee', candidates: 'Candidates',
      thammamun: 'Wat Thammamun Worawihan Classroom (Chai Nat) sits at the central campus.',
      mapNote: 'Directions search the address given in the list. Check the location before you travel.',
      howTitle: 'How to use',
      how: ['Open “Find seat” and type your name, surname or student ID.', 'Tap your name to see your seat number, room, building and your class’s timetable.', 'Tap “Save as my ticket”. The app remembers it on this device and shows it on the home screen.', 'Use “Add to calendar” for reminders, and “Directions” to open the map.'],
      glossTitle: 'Abhidhamma class levels',
      glossLead: 'Nine classes in three levels, each with three grades (Tri → Do → Eka).',
      lvlNames: ['Cūḷa-ābhidhammika (elementary)', 'Majjhima-ābhidhammika (intermediate)', 'Mahā-ābhidhammika (advanced)'],
      lvlNotes: ['', 'Eka grade: Certificate in Majjhima-ābhidhammika (ป.มอ.)', 'Eka grade: Abhidhamma Bandit degree programme (ป.อบ.), class 63/2569'],
      faqTitle: 'Frequently asked questions',
      faq: [
        ['I can’t find my name', 'Type only your first name or only your surname, without titles (Phra, Mr, Mrs, Mae Chee…). Spaces and the Pali dot (พินทุ) are ignored. If nothing matches exactly, close spellings are shown. Some new students have no student ID in the list, so search by name. If you are still missing, contact your centre.'],
        ['What is the “Seat No.”?', 'It is your number (เลขที่) in the official candidate list. At the central campus numbers run per class, and each room takes a block of numbers. At branch centres numbers run through the whole centre. The seat grid in the app follows list order; it is not a floor plan.'],
        ['Why is there no room number?', 'For central Cūḷa-Do and Cūḷa-Eka the list only says “ตึก มจร” (MCU Building) with no room. Most branch centres also hold the exam on site without naming rooms. Check the notices on exam day.'],
        ['My name appears twice', 'A few candidates appear in both the central and a branch list, or are registered for two classes. The app shows every listing with a warning. Confirm with your centre where you should sit.'],
        ['Is my data sent anywhere?', 'No. Search runs entirely on your device, and “My ticket” is stored only in this browser.'],
      ],
      statsTitle: 'Candidate statistics', statsLead: 'From the official statistics sheet, semester 2/2569',
      statsCentral: 'Central', statsBranch: 'Branches', statsTotal: 'Total',
      statsFoot: 'The seating lists in this app hold {n} entries (some people sit two classes or are listed twice); the statistics sheet totals {s} candidates.',
      srcTitle: 'Official source documents',
      src: [['page', 'Announcement page: Abhidhamma exam 2/2569'], ['schedule', 'Exam timetable 6902 (PDF)'], ['central', 'Seating list, central campus อชว. (PDF)'], ['branches', 'Seating list, branch centres (PDF)'], ['stats', 'Candidate statistics (PDF)'], ['list', 'Eligible candidates 6902 (Excel)']],
      disclaimer: 'This is not an official channel of Abhidhamma Jotika College. It was made to help students read the documents published as of 1 November 2026. If anything differs, the college’s notices and the instructions at the venue take precedence.',
      loadErr: 'Could not load the data. Check your connection and try again.',
      shareText: '{name}\n{cls} · Seat No. {seat}\nRoom: {room}\nVenue: {venue}\nExams 20–22 Nov 2026',
      dayShort: (d) => `${d.en} ${d.n} Nov`,
    },
  };
  let lang = store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('th') ? 'th' : (navigator.language ? 'en' : 'th'));
  const t = (k, vars) => {
    let s = T[lang][k] ?? T.th[k] ?? k;
    if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (_, v) => (vars[v] ?? ''));
    return s;
  };
  const cname = (c, short = false) => {
    const ci = CLASS_INFO[c];
    return lang === 'th' ? (short ? ci.short : ci.th) : (short ? ci.enShort : ci.en);
  };

  // ---------------------------------------------------------------- data
  let D = null;           // raw json
  let S = [];             // students (objects)
  let centreById = {};
  const ZW = /[\s ​-‍﻿.\-–()]/g;
  const norm = (s) => String(s).normalize('NFC').toLowerCase().replace(/ํา/g, 'ำ').replace(/ฺ/g, '').replace(ZW, '');
  const loose = (s) => norm(s).replace(/[ัิ-ู็-๎]/g, '');
  const keyOf = (s) => `${s.venue}~${s.cls}~${s.seat}`;

  function prepare(json) {
    D = json;
    D.centres.forEach((c) => { centreById[c.id] = c; });
    S = D.students.map((r, i) => {
      const [seat, sid, name, cls, venue, room, affil, flags] = r;
      return { i, seat, sid, name, cls, venue, room, affil, flags, n: norm(name), l: loose(name), d: sid.replace(/\D/g, '') };
    });
    // peers by room+class, used for the seat grid
    const groups = new Map();
    for (const s of S) {
      const k = s.venue === 'central' ? `r${s.room}~${s.cls}` : `v${s.venue}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(s);
    }
    for (const g of groups.values()) g.sort((a, b) => a.seat - b.seat);
    D.groups = groups;
    // same-name map (to show other listings of the same person)
    D.byName = new Map();
    for (const s of S) {
      if (!D.byName.has(s.n)) D.byName.set(s.n, []);
      D.byName.get(s.n).push(s);
    }
  }

  // ---------------------------------------------------------------- venue / room text
  const isTh = () => lang === 'th';
  function venueName(id, withProv = false) {
    const c = centreById[id];
    if (!c) return '';
    const nm = isTh() ? c.th : c.en;
    return withProv && id !== 'central' ? `${nm} · ${isTh() ? c.provTh : c.provEn}` : nm;
  }
  function bldText(b) {
    if (!b) return '';
    let m;
    if ((m = b.match(/^ตึก\s*มธ\.?\s*ชั้น\s*(\d+)/))) return isTh() ? `ตึกมหาธาตุวิทยาลัย (มธ.) ชั้น ${m[1]}` : `Mahathat Witthayalai Bldg (มธ.), floor ${m[1]}`;
    if ((m = b.match(/^ตึก\s*อชว\.?\s*ชั้น\s*(\d+)/))) return isTh() ? `ตึกอภิธรรมโชติกะวิทยาลัย (อชว.) ชั้น ${m[1]}` : `Abhidhamma Jotika College Bldg (อชว.), floor ${m[1]}`;
    if (/^ตึก\s*มจร/.test(b)) return isTh() ? 'ตึก มจร' : 'MCU Building (ตึก มจร)';
    if (/ปริยัติธรรมอนาลโย/.test(b)) return isTh() ? 'อาคารปริยัติธรรมอนาลโยฯ' : 'Pariyattitham Analayo Bldg (อ.ปริยัติธรรมอนาลโยฯ)';
    return b;
  }
  function roomText(r) {
    if (!r) return '';
    let m;
    if (/^(มธ|อชว)\./.test(r)) return isTh() ? r : r.replace('(มุข)', ' (มุข wing)');
    if ((m = r.match(/^ชั้น\s*(\d+)\s*-\s*(\d+)/))) return isTh() ? `ชั้น ${m[1]} ห้อง ${m[2]}` : `Floor ${m[1]}, room ${m[2]}`;
    if ((m = r.match(/^ชั้นล่าง\s*-\s*(\d+)/))) return isTh() ? `ชั้นล่าง ห้อง ${m[1]}` : `Ground floor, room ${m[1]}`;
    if (/ชั้นล่าง\s*-\s*ห้องโถง/.test(r)) return isTh() ? 'ชั้นล่าง ห้องโถง' : 'Ground floor, main hall';
    return r;
  }
  // Returns {room, roomSub, bld, tba, atCentre}
  function placeOf(s) {
    const R = D.rooms[s.room];
    if (s.venue === 'central') {
      if (!R.room) return { room: t('roomTba'), bld: bldText(R.bld), tba: true };
      return { room: roomText(R.room), bld: bldText(R.bld) };
    }
    if (!R.room) return { room: t('atCentre'), bld: venueName(s.venue), atCentre: true };
    return { room: roomText(R.room), bld: bldText(R.bld) };
  }
  const mapUrl = (id) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centreById[id].map)}`;

  // ---------------------------------------------------------------- search
  function search(q, fc, fv) {
    const raw = q.trim();
    const pool = S.filter((s) => (fc === '' || s.cls === +fc) && (fv === '' || s.venue === fv));
    if (!raw) return { list: [], state: 'empty' };
    const digits = raw.replace(/[\s-]/g, '');
    if (/^\d+$/.test(digits)) {
      if (digits.length < 3) return { list: [], state: 'short' };
      const list = pool.filter((s) => s.d.includes(digits))
        .sort((a, b) => (b.d === digits) - (a.d === digits) || a.d.indexOf(digits) - b.d.indexOf(digits) || a.d.localeCompare(b.d));
      return { list, state: 'ok' };
    }
    const toks = raw.split(/\s+/).map(norm).filter(Boolean);
    if (toks.join('').length < 2) return { list: [], state: 'short' };
    let list = pool.filter((s) => toks.every((k) => s.n.includes(k) || (s.sid && norm(s.sid).includes(k))));
    let approx = false;
    if (!list.length) {
      const lt = raw.split(/\s+/).map(loose).filter((x) => x.length >= 2);
      if (lt.length) {
        list = pool.filter((s) => lt.every((k) => s.l.includes(k)));
        approx = list.length > 0;
      }
    }
    list.sort((a, b) => a.n.indexOf(toks[0]) - b.n.indexOf(toks[0]) || a.n.length - b.n.length || a.cls - b.cls);
    return { list, state: 'ok', approx };
  }

  function highlight(name, q) {
    const toks = q.trim().split(/\s+/).filter((x) => x.length >= 1).sort((a, b) => b.length - a.length);
    let out = esc(name);
    for (const tk of toks) {
      const e = esc(tk).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!e) continue;
      try { out = out.replace(new RegExp(`(${e})(?![^<]*>)`, 'i'), '<mark>$1</mark>'); } catch { /* ignore */ }
    }
    return out;
  }

  const MAX = 40;
  let lastResults = [];
  function renderResults() {
    const q = $('#q').value;
    const fc = $('#fClass').value;
    const fv = $('#fVenue').value;
    $('#qClear').hidden = !q;
    const box = $('#results');
    const { list, state, approx } = search(q, fc, fv);
    lastResults = list;
    if (state === 'empty') { box.innerHTML = ''; return; }
    if (state === 'short') { box.innerHTML = `<p class="res-head">${esc(t('tooShort'))}</p>`; return; }
    if (!list.length) {
      box.innerHTML = `<div class="empty"><strong>${esc(t('noRes'))}</strong>${esc(t('noResHelp'))}</div>`;
      return;
    }
    const shown = list.slice(0, MAX);
    const sel = current ? current.i : -1;
    box.innerHTML =
      `<p class="res-head">${esc(t('resCount', { n: fmtN(list.length) }))}${approx ? ` · ${esc(t('resApprox'))}` : ''}</p>` +
      shown.map((s) => {
        const p = placeOf(s);
        return `<button type="button" class="res" data-i="${s.i}" ${s.i === sel ? 'aria-current="true"' : ''}>
          <span class="nm">${highlight(s.name, approx ? '' : q)}</span>
          <span class="seat"><small>${esc(t('seatShort'))}</small><b>${s.seat}</b></span>
          <span class="meta"><span>${esc(cname(s.cls, true))}</span><span>${esc(p.atCentre ? venueName(s.venue) : p.room)}</span>${s.venue === 'central' ? `<span>${esc(isTh() ? 'ส่วนกลาง' : 'Central')}</span>` : ''}${s.sid ? `<span>${esc(s.sid)}</span>` : ''}</span>
        </button>`;
      }).join('') +
      (list.length > MAX ? `<p class="more">${esc(t('resMore', { shown: MAX, n: fmtN(list.length) }))}</p>` : '');
  }

  // ---------------------------------------------------------------- ticket
  let current = null;
  function bkkToday() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function bkkNowMin() {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const [h, m] = p.split(':').map(Number);
    return h * 60 + m;
  }
  const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  function nextSessionIdx(cls) {
    const plan = planOf(cls);
    const today = bkkToday();
    const now = bkkNowMin();
    for (let d = 0; d < 3; d++) {
      const p = plan[d];
      if (!p) continue;
      if (DAYS[d].iso > today || (DAYS[d].iso === today && toMin(p.e) > now)) return d;
    }
    return -1;
  }
  const sessLabel = (p) => `${p.k === 'w' ? t('written') : t('oral')} · ${t('qn', { q: p.q })}`;
  const timeLabel = (p) => `${p.s.replace(':', '.')}–${p.e.replace(':', '.')}${t('timeUnit') ? ' ' + t('timeUnit') : ''}`;

  function ticketHTML(s) {
    const p = placeOf(s);
    const c = centreById[s.venue];
    const plan = planOf(s.cls);
    const nx = nextSessionIdx(s.cls);
    const saved = store.get('mine') === keyOf(s);
    const affil = D.affils[s.affil];
    const showAffil = affil && affil[2] !== s.venue && !(s.venue === 'central' && affil[2] === null && /มจร/.test(affil[0]) && /ส่วนกลาง/.test(affil[0]));

    // alerts
    const alerts = [];
    if (s.flags & 1) alerts.push(t('flagDup'));
    if (s.flags & 2) alerts.push(t('flagSharedId'));
    if (p.tba) alerts.push(t('roomTbaHelp'));

    // other listings of the same name
    const others = (D.byName.get(s.n) || []).filter((o) => o.i !== s.i);

    // seat grid / range
    let seatBlock = '';
    if (s.venue === 'central') {
      const g = D.groups.get(`r${s.room}~${s.cls}`) || [];
      // only a real, named room can be "shared"; the unnamed "ตึก มจร" entry is not one room
      const sharing = p.tba ? [] : D.alloc.filter((a) => a.r === s.room && a.c !== s.cls);
      const where = p.tba ? p.bld : p.room;
      if (g.length && g.length <= 130) {
        seatBlock = `<h3>${esc(t('seatsInRoom', { cls: cname(s.cls, true) }))} <span class="small-print">· ${esc(t('seatsNote'))}</span></h3>
          <div class="seatgrid" role="img" aria-label="${esc(t('seatsRange', { pos: g.indexOf(s) + 1, n: g.length, where }))}">
          ${g.map((o) => `<span class="${o.i === s.i ? 'me' : ''}">${o.seat}</span>`).join('')}</div>
          <p class="small-print">${esc(t('seatsRange', { pos: g.indexOf(s) + 1, n: g.length, where }))}${sharing.length ? ' · ' + esc(t('sharedRoom', { list: sharing.map((a) => `${cname(a.c, true)} (${t('seatsFT', { a: a.from, b: a.to })})`).join(', ') })) : ''}</p>`;
      }
    } else {
      const g = D.groups.get(`v${s.venue}`) || [];
      const pos = g.indexOf(s) + 1;
      const pct = g.length > 1 ? ((pos - 1) / (g.length - 1)) * 100 : 50;
      seatBlock = `<h3>${esc(t('seatNo'))} <span class="small-print">· ${esc(t('seatsNote'))}</span></h3>
        <div class="rangebar" role="img" aria-label="${esc(t('seatsRange', { pos, n: g.length, where: t('thisCentre') }))}"><i style="left:${pct.toFixed(1)}%"></i></div>
        <div class="rangebar-lbl"><span>1</span><span>${g.length}</span></div>
        <p class="small-print">${esc(t('seatsRange', { pos, n: g.length, where: venueName(s.venue) }))}</p>`;
    }

    const timeline = DAYS.map((d, k) => {
      const ps = plan[k];
      if (!ps) return `<li class="off"><span class="date"><small>${esc(isTh() ? d.th : d.en)}</small><b>${d.n}</b></span><span class="what"><b>${esc(t('noExam'))}</b></span></li>`;
      return `<li class="${k === nx ? 'next' : ''}"><span class="date"><small>${esc(isTh() ? d.th : d.en)}</small><b>${d.n}</b></span>
        <span class="what"><b>${esc(timeLabel(ps))}</b><span>${esc(sessLabel(ps))}${ps.note ? ' — ' + esc(t(ps.note)) : ''}</span></span></li>`;
    }).join('');

    return `<article class="ticket" aria-label="${esc(t('myTicket'))}">
      <div class="ticket-top">
        <button type="button" class="ticket-back" data-act="back">${icon('i-back')}${esc(t('back'))}</button>
        <div class="ticket-kicker">
          <span class="pill">${esc(cname(s.cls, true))}</span>
          <span class="pill line">${esc(s.venue === 'central' ? (isTh() ? 'ส่วนกลาง' : 'Central campus') : (isTh() ? 'หน่วยบริการฯ' : 'Branch centre'))}</span>
          ${saved ? `<span class="pill soft">${icon('i-star-f')}${esc(t('myTicket'))}</span>` : ''}
        </div>
        <h2 class="ticket-name">${esc(s.name)}</h2>
        <div class="ticket-id">${esc(t('sid'))}: ${s.sid ? esc(s.sid) : `<em>${esc(t('noId'))}</em>`} · ${esc(cname(s.cls))}</div>
      </div>
      <div class="ticket-perf" aria-hidden="true"></div>
      <div class="ticket-main">
        <div class="kv">
          <div class="seatbox"><small>${esc(t('seatNo'))}</small><b>${s.seat}</b></div>
          <div class="kv-item"><small>${esc(t('room'))}</small><b>${esc(p.room)}</b>${p.atCentre ? `<span>${esc(t('atCentreSub'))}</span>` : ''}</div>
          ${p.atCentre
            ? `<div class="kv-item"><small>${esc(t('province'))}</small><b>${esc(isTh() ? c.provTh : c.provEn)}</b></div>`
            : `<div class="kv-item"><small>${esc(t('building'))}</small><b>${esc(p.bld)}</b></div>`}
          <div class="kv-item kv-wide"><small>${esc(t('venue'))}</small><b>${esc(venueName(s.venue))}</b>
            <span>${esc(s.venue === 'central' ? t('centralRoomsSub') : (c.addrTh || ''))}</span></div>
          ${showAffil ? `<div class="kv-item kv-wide"><small>${esc(t('affil'))}</small><b>${esc(isTh() ? affil[0] : affil[1])}</b></div>` : ''}
        </div>
        ${alerts.map((a) => `<div class="alert" role="note">${icon('i-warn')}<span>${esc(a)}</span></div>`).join('')}
        ${others.length ? `<div class="alert" role="note">${icon('i-info')}<span>${esc(t('alsoListed'))}: ${others.map((o) => `<a href="#t/${encodeURIComponent(keyOf(o))}">${esc(cname(o.cls, true))} · ${esc(venueName(o.venue))} · ${esc(t('seatShort'))} ${o.seat}</a>`).join(' ; ')}</span></div>` : ''}
        <h3>${esc(t('mySchedule'))}</h3>
        <ol class="timeline">${timeline}</ol>
        <div class="seatmap">${seatBlock}</div>
      </div>
      <div class="actions">
        <button type="button" class="btn primary ${saved ? 'saved' : ''}" data-act="save" aria-pressed="${saved}">${icon(saved ? 'i-star-f' : 'i-star')}${esc(saved ? t('saved') : t('save'))}</button>
        <button type="button" class="btn" data-act="cal">${icon('i-calplus')}${esc(t('addCal'))}</button>
        <a class="btn" href="${mapUrl(s.venue)}" target="_blank" rel="noopener">${icon('i-nav')}${esc(t('directions'))}</a>
        <button type="button" class="btn" data-act="share">${icon('i-share')}${esc(t('share'))}</button>
      </div>
    </article>`;
  }

  function placeholderHTML() {
    return `<div class="card ticket-placeholder">${icon('i-search')}<h2>${esc(t('phTitle'))}</h2><ol>${t('phSteps')}</ol></div>`;
  }

  function showTicket(s, { scroll = true } = {}) {
    current = s;
    const col = $('#ticketCol');
    col.innerHTML = s ? ticketHTML(s) : placeholderHTML();
    $('.find-grid').classList.toggle('show-ticket', !!s);
    $$('.res').forEach((b) => b.toggleAttribute('aria-current', s && +b.dataset.i === s.i));
    $$('.res[aria-current]').forEach((b) => b.setAttribute('aria-current', 'true'));
    if (s && scroll && window.matchMedia('(max-width: 899px)').matches) {
      col.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderMine() {
    const k = store.get('mine');
    const s = k ? S.find((x) => keyOf(x) === k) : null;
    const slot = $('#myTicketSlot');
    if (!s) { slot.innerHTML = ''; return null; }
    const p = placeOf(s);
    slot.innerHTML = `<button type="button" class="mine" data-i="${s.i}">${icon('i-star-f')}
      <span class="t"><small>${esc(t('myTicket'))}</small><b>${esc(s.name)}</b><span>${esc(cname(s.cls, true))} · ${esc(p.atCentre ? venueName(s.venue) : p.room)}</span></span>
      <span class="s">${s.seat}<small>${esc(t('seatShort'))}</small></span></button>`;
    return s;
  }

  // ---------------------------------------------------------------- calendar / share
  function icsFor(s) {
    const p = placeOf(s);
    const plan = planOf(s.cls);
    const loc = `${p.room} · ${p.bld} · ${venueName(s.venue)}`;
    const escI = (x) => String(x).replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const utc = (iso, hm) => { const [h, m] = hm.split(':').map(Number); const d = new Date(`${iso}T00:00:00Z`); d.setUTCHours(h - 7, m); return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ev = [];
    plan.forEach((ps, k) => {
      if (!ps) return;
      const d = DAYS[k];
      const title = `${isTh() ? 'สอบพระอภิธรรม' : 'Abhidhamma exam'} ${cname(s.cls, true)} – ${ps.k === 'w' ? t('written') : t('oral')}`;
      const desc = `${s.name}\n${t('seatNo')}: ${s.seat}\n${t('room')}: ${p.room}\n${sessLabel(ps)}${ps.note ? '\n' + t(ps.note) : ''}`;
      ev.push(['BEGIN:VEVENT', `UID:abh6902-${s.venue}-${s.cls}-${s.seat}-${k}@exam-guide`, `DTSTAMP:${stamp}`,
        `DTSTART:${utc(d.iso, ps.s)}`, `DTEND:${utc(d.iso, ps.e)}`, `SUMMARY:${escI(title)}`, `LOCATION:${escI(loc)}`,
        `DESCRIPTION:${escI(desc)}`, 'BEGIN:VALARM', 'TRIGGER:-PT90M', 'ACTION:DISPLAY', `DESCRIPTION:${escI(title)}`, 'END:VALARM', 'END:VEVENT'].join('\r\n'));
    });
    // RFC 5545 line folding: at most 75 octets per line (Thai is 3 bytes per character)
    const enc = new TextEncoder();
    const fold = (line) => {
      const out = []; let cur = ''; let bytes = 0;
      for (const ch of line) {
        const b = enc.encode(ch).length;
        if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
        cur += ch; bytes += b;
      }
      out.push(cur);
      return out.join('\r\n ');
    };
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//abhidhamma-exam-guide//6902//TH', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...ev, 'END:VCALENDAR']
      .join('\r\n').split('\r\n').map(fold).join('\r\n');
  }
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function share(s) {
    const p = placeOf(s);
    const text = t('shareText', { name: s.name, cls: cname(s.cls), seat: s.seat, room: `${p.room} (${p.bld})`, venue: venueName(s.venue) });
    const url = location.href.split('#')[0] + '#t/' + encodeURIComponent(keyOf(s));
    if (navigator.share) {
      try { await navigator.share({ title: t('appTitle'), text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); toast(t('copied')); } catch { toast(text); }
  }
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  // ---------------------------------------------------------------- countdown
  function renderCountdown() {
    const el = $('#countdown');
    const today = bkkToday();
    const mine = store.get('mine') ? S.find((x) => keyOf(x) === store.get('mine')) : null;
    const start = DAYS[0].iso;
    const end = DAYS[2].iso;
    const diff = Math.round((Date.parse(start) - Date.parse(today)) / 864e5);
    let big = '', title = '', sub = '';
    if (today < start) {
      big = `${diff}<small>${esc(t('cdUnit'))}</small>`;
      title = diff === 1 ? t('cdTomorrow') : t('cdBefore', { n: diff });
      if (mine) {
        const plan = planOf(mine.cls);
        const k = plan.findIndex(Boolean);
        sub = t('cdMine', { cls: cname(mine.cls, true), day: (isTh() ? 'วัน' : '') + T[lang].dayShort(DAYS[k]), time: plan[k].s.replace(':', '.') });
      } else sub = t('cdBeforeSub');
    } else if (today <= end) {
      const k = DAYS.findIndex((d) => d.iso === today);
      big = `${DAYS[k].n}<small>${esc(isTh() ? 'พ.ย.' : 'Nov')}</small>`;
      title = t('cdToday', { k: k + 1 });
      if (mine) {
        const ps = planOf(mine.cls)[k];
        sub = ps ? t('cdTodayMine', { cls: cname(mine.cls, true), what: ps.k === 'w' ? t('written') : t('oral'), time: timeLabel(ps) }) : t('cdTodayNone');
      } else sub = isTh() ? DAYS[k].thFull : DAYS[k].enFull;
    } else {
      big = '✓';
      title = t('cdAfter'); sub = t('cdAfterSub');
    }
    el.innerHTML = `<div class="big">${big}</div><div class="txt"><strong>${esc(title)}</strong><span>${esc(sub)}</span></div>`;
  }

  // ---------------------------------------------------------------- schedule view
  let schedClass = '';
  function renderSchedule() {
    const chips = $('#schedClassChips');
    chips.innerHTML = [`<button type="button" class="chip" role="radio" data-c="" aria-checked="${schedClass === ''}">${esc(t('allChip'))}</button>`]
      .concat(CLASS_INFO.map((_, c) => `<button type="button" class="chip" role="radio" data-c="${c}" aria-checked="${schedClass === String(c)}">${esc(cname(c, true))}</button>`)).join('');
    const classes = schedClass === '' ? CLASS_INFO.map((_, c) => c) : [+schedClass];

    $('#schedDays').innerHTML = DAYS.map((d, k) => {
      // group classes that share the same session on this day
      const grp = new Map();
      for (const c of classes) {
        const ps = planOf(c)[k];
        if (!ps) continue;
        const key = JSON.stringify(ps);
        if (!grp.has(key)) grp.set(key, { ps, cs: [] });
        grp.get(key).cs.push(c);
      }
      const items = [...grp.values()].sort((a, b) => a.ps.s.localeCompare(b.ps.s)).map(({ ps, cs }) => `
        <div class="sess ${ps.k === 'o' ? 'oral' : ''}"><div class="tm">${esc(timeLabel(ps))}</div>
        <div class="ty">${esc(sessLabel(ps))}</div>
        <div class="who">${esc(cs.map((c) => cname(c, true)).join(', '))}</div>
        ${ps.note ? `<div class="nt">${esc(t(ps.note))}</div>` : ''}</div>`).join('');
      return `<article class="day"><div class="day-h"><span class="n">${d.n}</span><span class="w"><b>${esc(isTh() ? 'วัน' + d.th : d.enFull.split(',')[0])}</b><span>${esc(isTh() ? 'พฤศจิกายน 2569' : 'November 2026')}</span></span></div>
        <div class="day-b">${items || `<div class="day-none">${esc(t('noExam'))}</div>`}</div></article>`;
    }).join('');

    $('#schedMatrix').innerHTML = `<thead><tr><th scope="col">${esc(t('classCol'))}</th>${DAYS.map((d) => `<th scope="col">${esc(T[lang].dayShort(d))}</th>`).join('')}</tr></thead>
      <tbody>${CLASS_INFO.map((_, c) => `<tr class="${schedClass === String(c) ? 'hl' : ''}"><th scope="row">${esc(cname(c, true))}</th>${planOf(c).map((ps) => ps
        ? `<td class="${ps.k === 'o' ? 'oral' : ''}"><b>${esc(ps.s.replace(':', '.'))}–${esc(ps.e.replace(':', '.'))}</b><br>${esc(t(ps.k === 'w' ? 'wShort' : 'oShort', { q: ps.q }))}</td>`
        : `<td class="none">—</td>`).join('')}</tr>`).join('')}</tbody>`;

    $('#schedNotes').innerHTML = `<h2>${esc(t('notesTitle'))}</h2><ul>${T[lang].notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  }

  // ---------------------------------------------------------------- venues view
  let seg = 'central';
  function renderVenues() {
    $('#tabCentral').setAttribute('aria-selected', seg === 'central');
    $('#tabBranch').setAttribute('aria-selected', seg === 'branch');
    $('#segCentral').hidden = seg !== 'central';
    $('#segBranch').hidden = seg !== 'branch';
    $('#centralMap').href = mapUrl('central');
    $('#bldLegend').innerHTML = T[lang].legend.map(([a, b]) => `<div><code>${esc(a)}</code><span>${esc(b)}</span></div>`).join('');

    // central allocation, per class
    $('#centralAlloc').innerHTML = CLASS_INFO.map((_, c) => {
      const al = D.alloc.filter((a) => a.c === c && D.rooms[a.r].venue === 'central').sort((a, b) => a.from - b.from);
      const n = al.reduce((x, a) => x + a.n, 0);
      return `<section class="alloc-class"><h3><span>${esc(cname(c))}</span><small>${esc(t('people', { n: fmtN(n) }))}</small></h3>
        <div class="alloc-rooms">${al.map((a) => {
          const R = D.rooms[a.r];
          return `<div class="room-chip ${R.room ? '' : 'tba'}"><b>${esc(R.room ? roomText(R.room) : t('roomTba'))}</b><span>${esc(bldText(R.bld))}</span>
            <span class="rng">${esc(t('seatsFT', { a: a.from, b: a.to }))}</span><span>${esc(t('people', { n: a.n }))}</span></div>`;
        }).join('')}</div></section>`;
    }).join('');

    const rf = $('#rfClass');
    const keep = rf.value;
    rf.innerHTML = CLASS_INFO.map((_, c) => `<option value="${c}">${esc(cname(c, true))}</option>`).join('');
    if (keep) rf.value = keep;
    renderRoomFinder();
    renderCentres();
  }
  function renderRoomFinder() {
    const c = +$('#rfClass').value;
    const seat = parseInt($('#rfSeat').value, 10);
    const out = $('#rfOut');
    if (!seat) { out.innerHTML = ''; return; }
    const s = S.find((x) => x.venue === 'central' && x.cls === c && x.seat === seat);
    if (!s) { out.innerHTML = `<div class="empty">${esc(t('rfNone', { seat, cls: cname(c, true) }))}</div>`; return; }
    const p = placeOf(s);
    out.innerHTML = `<div class="rf-result"><div><small class="muted">${esc(t('rfGo', { seat }))}</small><br><b>${esc(p.room)}</b></div><div class="muted">${esc(p.bld)}</div></div>`;
  }
  function renderCentres() {
    const q = norm($('#centreQ').value || '');
    const list = D.centres.filter((c) => c.id !== 'central')
      .filter((c) => !q || [c.th, c.en, c.provTh, c.provEn, c.addrTh, c.label].some((x) => norm(x || '').includes(q)))
      .sort((a, b) => (isTh() ? a.th.localeCompare(b.th, 'th') : a.en.localeCompare(b.en, 'en')));
    const total = list.reduce((x, c) => x + c.total, 0);
    $('#centreCount').textContent = t('centreCount', { n: fmtN(list.length), p: fmtN(total) });
    $('#centreList').innerHTML = list.map((c) => `<article class="centre">
        <div class="top"><div><h3>${esc(isTh() ? c.th : c.en)}</h3><div class="sub">${esc(isTh() ? c.provTh : `${c.th} · ${c.provEn}`)}</div></div>
        <div class="count">${fmtN(c.total)}<small>${esc(t('candidates'))}</small></div></div>
        <div class="addr">${esc(c.addrTh)}</div>
        <div class="bars">${c.counts.map((n, i) => n ? `<span>${esc(cname(i, true))} <b>${n}</b></span>` : '').join('')}</div>
        <div class="foot"><span class="sub">${c.committee ? `${esc(t('committee'))}: ${esc(c.committee)}` : ''}</span>
        <a class="btn" href="${mapUrl(c.id)}" target="_blank" rel="noopener">${icon('i-nav')}${esc(t('directions'))}</a></div>
      </article>`).join('') +
      (!q ? `<div class="card note"><p>${esc(t('thammamun'))}</p><p class="small-print">${esc(t('mapNote'))}</p></div>` : '');
  }

  // ---------------------------------------------------------------- info view
  function renderInfo() {
    const L = T[lang];
    const st = D.centres; // counts from lists
    const statsRows = (() => {
      const central = centreById.central.counts;
      const branch = CLASS_INFO.map((_, i) => st.filter((c) => c.id !== 'central').reduce((x, c) => x + c.counts[i], 0));
      return CLASS_INFO.map((_, i) => `<tr><th scope="row">${esc(cname(i, true))}</th><td>${fmtN(central[i])}</td><td>${fmtN(branch[i])}</td><td><b>${fmtN(central[i] + branch[i])}</b></td></tr>`).join('');
    })();
    const files = D.meta.files;
    const srcUrl = (k) => (k === 'page' ? D.meta.source : files[k]);
    $('#infoBody').innerHTML = `
      <div class="info-grid">
        <div class="card"><h1>${esc(L.howTitle)}</h1><ol class="steps">${L.how.map((x) => `<li><span>${esc(x)}</span></li>`).join('')}</ol></div>
        <div class="card"><h2>${esc(L.glossTitle)}</h2><p class="muted">${esc(L.glossLead)}</p>
          <dl class="gloss">${[0, 1, 2].map((lv) => `<dt>${esc(L.lvlNames[lv])}</dt><dd>${CLASS_INFO.filter((c) => c.lvl === lv).map((c) => esc(lang === 'th' ? c.short : `${c.enShort} (${c.short})`)).join(' → ')}${L.lvlNotes[lv] ? `<br><small>${esc(L.lvlNotes[lv])}</small>` : ''}</dd>`).join('')}</dl>
          <h3 style="margin-top:14px">${esc(lang === 'th' ? 'อักษรย่ออาคาร' : 'Building abbreviations')}</h3>
          <dl class="gloss">${L.legend.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div>
        <div class="card"><h2>${esc(L.faqTitle)}</h2>${L.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
        <div class="card"><h2>${esc(L.statsTitle)}</h2><p class="muted">${esc(lang === 'th' ? 'จำนวนรายการในบัญชีที่นั่งสอบ แยกตามชั้น' : 'Entries in the seating lists, by class')}</p>
          <div class="table-wrap"><table class="matrix" style="min-width:0"><thead><tr><th>${esc(L.classCol)}</th><th>${esc(L.statsCentral)}</th><th>${esc(L.statsBranch)}</th><th>${esc(L.statsTotal)}</th></tr></thead><tbody>${statsRows}</tbody></table></div>
          <p class="small-print">${esc(t('statsFoot', { n: fmtN(S.length), s: fmtN(D.meta.statsGrandTotal) }))}</p></div>
        <div class="card"><h2>${esc(L.srcTitle)}</h2><ul class="links">${L.src.map(([k, label]) => `<li><a href="${esc(srcUrl(k))}" target="_blank" rel="noopener"><span>${esc(label)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>
        <div class="card note"><p class="disclaimer">${esc(L.disclaimer)}</p></div>
      </div>`;
  }

  // ---------------------------------------------------------------- language + chrome
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = lang === 'th' ? 'คู่มือสอบพระอภิธรรม ภาค 2/2569' : 'Abhidhamma Exam Guide · Semester 2/2569';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    if (!D) return;
    // filters
    const fc = $('#fClass'), fv = $('#fVenue');
    const kc = fc.value, kv = fv.value;
    fc.innerHTML = `<option value="">${esc(t('allClasses'))}</option>` + CLASS_INFO.map((_, c) => `<option value="${c}">${esc(cname(c, true))}</option>`).join('');
    const cs = D.centres.filter((c) => c.id !== 'central').sort((a, b) => (isTh() ? a.th.localeCompare(b.th, 'th') : a.en.localeCompare(b.en, 'en')));
    fv.innerHTML = `<option value="">${esc(t('allVenues'))}</option><option value="central">${esc(venueName('central'))}</option>` +
      cs.map((c) => `<option value="${c.id}">${esc(venueName(c.id, true))}</option>`).join('');
    fc.value = kc; fv.value = kv;
    renderAll();
  }
  function renderAll() {
    renderCountdown();
    renderMine();
    renderResults();
    showTicket(current, { scroll: false });
    renderSchedule();
    renderVenues();
    renderInfo();
  }

  // ---------------------------------------------------------------- routing
  const VIEWS = ['find', 'schedule', 'venues', 'info'];
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    let view = VIEWS.includes(h) ? h : 'find';
    if (h.startsWith('t/') && D) {
      const s = S.find((x) => keyOf(x) === h.slice(2));
      if (s) { view = 'find'; showTicket(s); }
    } else if (view === 'find' && current && window.matchMedia('(max-width: 899px)').matches) {
      showTicket(null, { scroll: false });
    }
    VIEWS.forEach((v) => { $(`#view-${v}`).hidden = v !== view; });
    $$('[data-nav]').forEach((a) => (a.dataset.nav === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    if (!h.startsWith('t/')) window.scrollTo({ top: 0 });
  }

  // ---------------------------------------------------------------- events
  function bind() {
    let deb;
    $('#q').addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(renderResults, 110); });
    $('#searchForm').addEventListener('submit', (e) => {
      e.preventDefault(); renderResults();
      if (lastResults.length === 1) openTicket(lastResults[0]);
      $('#q').blur();
    });
    $('#qClear').addEventListener('click', () => { $('#q').value = ''; renderResults(); $('#q').focus(); });
    $('#fClass').addEventListener('change', renderResults);
    $('#fVenue').addEventListener('change', renderResults);
    document.addEventListener('click', (e) => {
      const r = e.target.closest('.res, .mine');
      if (r) { openTicket(S[+r.dataset.i]); return; }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      const act = a.dataset.act;
      if (act === 'back') { location.hash = '#find'; return; }
      if (!current) return;
      if (act === 'save') {
        const k = keyOf(current);
        if (store.get('mine') === k) { store.set('mine', null); toast(t('unsavedToast')); } else { store.set('mine', k); toast(t('savedToast')); }
        renderMine(); renderCountdown(); showTicket(current, { scroll: false });
      } else if (act === 'cal') {
        download(`abhidhamma-exam-2-2569-${CLASS_INFO[current.cls].enShort}.ics`, icsFor(current), 'text/calendar;charset=utf-8');
        toast(t('calToast'));
      } else if (act === 'share') share(current);
    });
    $$('.lang button').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; store.set('lang', lang); applyLang(); }));
    $('#schedClassChips').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (!c) return; schedClass = c.dataset.c; renderSchedule(); });
    $$('.seg button').forEach((b) => b.addEventListener('click', () => { seg = b.dataset.seg; renderVenues(); }));
    $('#rfClass').addEventListener('change', renderRoomFinder);
    $('#rfSeat').addEventListener('input', renderRoomFinder);
    $('#roomFinder').addEventListener('submit', (e) => e.preventDefault());
    $('#centreQ').addEventListener('input', renderCentres);
    window.addEventListener('hashchange', route);
  }
  function openTicket(s) {
    const h = '#t/' + encodeURIComponent(keyOf(s));
    if (location.hash !== h) location.hash = h; else showTicket(s);
  }

  // ---------------------------------------------------------------- boot
  async function boot() {
    applyLang();
    bind();
    $('#ticketCol').innerHTML = placeholderHTML();
    try {
      const res = await fetch('data/exam-data.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      prepare(await res.json());
    } catch (e) {
      $('#results').innerHTML = `<div class="empty"><strong>${esc(t('loadErr'))}</strong></div>`;
      console.error(e);
      return;
    }
    applyLang();
    route();
    setInterval(renderCountdown, 60_000);
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  boot();
})();
