/* My Ibadah v10 — English / বাংলা. Quran & hadith translations intentionally stay in English
   (Arabic text is never changed) until a verified Bangla source is added. */
'use strict';
(function(){
const BN_DIGITS='০১২৩৪৫৬৭৮৯';
const toBnDigits=s=>s.replace(/\d/g,d=>BN_DIGITS[d]);
let lang='en';try{lang=localStorage.getItem('myIbadah.lang')||'en';}catch{}

const D={
'Overview':'সারসংক্ষেপ','Tracker':'ট্র্যাকার','Suhoor':'সাহরি','Iftar':'ইফতার',
'Last 30 days':'গত ৩০ দিন',
'All dhikr':'সব যিকির','Dhikr types':'যিকিরের ধরন','Daily average':'দৈনিক গড়',
/* nav & chrome */
'Home':'হোম','Back to top':'উপরে যান','✨ Masha\'Allah — all 5 prayers completed':'✨ মাশাআল্লাহ — ৫ ওয়াক্ত নামাজ সম্পন্ন','Digital clock. Double-tap to switch to analog.':'ডিজিটাল ঘড়ি। অ্যানালগে বদলাতে ডাবল-ট্যাপ করুন।','Analog clock. Double-tap to switch to digital.':'অ্যানালগ ঘড়ি। ডিজিটালে বদলাতে ডাবল-ট্যাপ করুন।','Double-tap to switch clock':'ঘড়ি বদলাতে ডাবল-ট্যাপ করুন','Tip: double-tap the clock to switch digital / analog':'টিপস: ডিজিটাল / অ্যানালগ বদলাতে ঘড়িতে ডাবল-ট্যাপ করুন','Day streak':'দিনের ধারা','Home cards':'হোম কার্ড','Where did you pray?':'কোথায় নামাজ পড়লেন?','Please specify where':'কোথায় তা লিখুন','This month':'এই মাস','All time':'সর্বমোট','Total prayers':'মোট নামাজ','View details ›':'বিস্তারিত দেখুন ›','Hide details ‹':'বিস্তারিত লুকান ‹','By prayer':'ওয়াক্ত অনুযায়ী','Places you wrote under Others':'“অন্যান্য”-এ আপনার লেখা স্থান','Pick Jamaat, Single or Others on the Salah screen to see your stats':'পরিসংখ্যান দেখতে নামাজ স্ক্রিনে জামাত, একাকী বা অন্যান্য বাছাই করুন','Add ›':'যোগ করুন ›','Change period':'সময়কাল পরিবর্তন','Others':'অন্যান্য','completed':'আদায়','My':'আমার','Ibadah':'ইবাদত','Qaza completed (this month)':'এই মাসে কাযা আদায়','per day · average':'প্রতিদিন · গড়','per week · average':'প্রতি সপ্তাহে · গড়','Salah':'নামাজ','Dhikr':'যিকির','Quran':'কুরআন','More':'আরও','Install':'ইনস্টল',
'My Ibadah':'আমার ইবাদত','Assalamu Alaikum':'আসসালামু আলাইকুম','Today':'আজ','Yesterday (tap for today)':'গতকাল (আজকে ফিরতে ট্যাপ করুন)','Tomorrow (tap for today)':'আগামীকাল (আজকে ফিরতে ট্যাপ করুন)','Back to today':'আজকে ফিরুন',
'NEXT PRAYER':'পরবর্তী নামাজ','Ayyam al-Bid':'আইয়্যামে বীজ','Day 1 of 3':'১ম দিন (৩ এর মধ্যে)','Day 2 of 3':'২য় দিন (৩ এর মধ্যে)','Day 3 of 3':'৩য় দিন (৩ এর মধ্যে)','Sunnah fast day':'সুন্নত রোজার দিন','Sunnah fast today':'আজ সুন্নত রোজা','Sunnah fast tomorrow':'আগামীকাল সুন্নত রোজা','NEXT':'পরবর্তী','Details ›':'বিস্তারিত ›','Change ›':'পরিবর্তন ›','Reports ›':'রিপোর্ট ›',
"Today's prayers":'আজকের নামাজ','Prayer times':'নামাজের সময়','Daily progress':'দৈনিক অগ্রগতি','Ibadah progress':'ইবাদতের অগ্রগতি','Avg':'গড়','prayers/day':'নামাজ/দিন','recitations/day':'যিকির/দিন','pages/day':'পৃষ্ঠা/দিন','✓ All goals completed':'✓ সব লক্ষ্য সম্পন্ন','Weekly dhikr':'সাপ্তাহিক যিকির','This week':'এই সপ্তাহ',
'Mark done':'সম্পন্ন করুন','✓ Done':'✓ সম্পন্ন','Done':'সম্পন্ন',
'Fajr':'ফজর','Dhuhr':'যোহর','Dhuhr ':'যোহর','Asr':'আসর','Maghrib':'মাগরিব','Isha':'ঈশা','Sunrise':'সূর্যোদয়',
'FAJR':'ফজর','DHUHR':'যোহর','ASR':'আসর','MAGHRIB':'মাগরিব','ISHA':'ঈশা',
'Overall':'মোট','OVERALL':'মোট','Salah ':'নামাজ',
'Duas':'দোয়া','Azkar':'আযকার','Good deeds':'সৎকাজ','Reports':'রিপোর্ট','Reports ':'রিপোর্ট',
'Total':'মোট','Most recited':'সবচেয়ে বেশি পঠিত','Open dhikr counter':'যিকির কাউন্টার খুলুন','No entries':'কোনো এন্ট্রি নেই',
'Good deeds today':'আজকের সৎকাজ','Fard prayers':'ফরজ নামাজ','Quran pages':'কুরআনের পৃষ্ঠা',
'✦ DAILY AYAH':'✦ আজকের আয়াত','HADITH OF THE DAY':'আজকের হাদিস','DAILY DUA':'আজকের দোয়া','Daily Hadith':'আজকের হাদিস',
'Keep going — every step counts':'চালিয়ে যান — প্রতিটি পদক্ষেপই মূল্যবান','Almost there — you are doing well':'প্রায় হয়ে গেছে — আপনি ভালো করছেন','✓ Daily goals completed':'✓ দৈনিক লক্ষ্য পূর্ণ হয়েছে','✓ Daily goal completed':'✓ দৈনিক লক্ষ্য পূর্ণ',
'Set a daily target':'দৈনিক লক্ষ্য ঠিক করুন','✓ All five prayers completed — alhamdulillah':'✓ পাঁচ ওয়াক্তই সম্পন্ন — আলহামদুলিল্লাহ',
'Dhaka, Bangladesh':'ঢাকা, বাংলাদেশ','Offline — open Prayer times to retry':'অফলাইন — আবার চেষ্টা করতে নামাজের সময় খুলুন',
/* salah */
'DAILY CHECKLIST':'দৈনিক তালিকা','Prayer tracker':'নামাজ ট্র্যাকার','Mark all':'সব চিহ্নিত','Clear':'মুছুন','How did you pray?':'কীভাবে নামাজ পড়েছেন?','Jamaat':'জামাত','Single':'একাকী','Others':'অন্যান্য',
'＋ Add extra prayer':'＋ অতিরিক্ত নামাজ যোগ করুন','e.g. 2 Rakat Nafl':'যেমন: ২ রাকাত নফল','Add':'যোগ করুন','Fard':'ফরজ','Sunnah':'সুন্নত','Witr':'বিতর','Optional':'নফল','Nafl':'নফল',
'Enter the prayer name first':'আগে নামাজের নাম লিখুন','Already in the list':'তালিকায় আগেই আছে','Prayer added':'নামাজ যোগ হয়েছে',
/* qaza */
'MAKE-UP PRAYERS':'কাযা নামাজ','Qaza tracker':'কাযা ট্র্যাকার','Completed Qaza (all time)':'মোট কাযা আদায়','Completed Qaza (this month)':'এই মাসে কাযা আদায়',"Today's Qaza":'আজকের কাযা','Add completed Qaza':'আদায়কৃত কাযা যোগ করুন','＋ Add 1':'＋ ১ যোগ করুন','Qaza completion recorded':'কাযা আদায় লেখা হয়েছে',
'Record completed Qaza prayers. Lifetime totals are saved separately from the daily checklist.':'আদায়কৃত কাযা নামাজ লিখে রাখুন। মোট সংখ্যা দৈনিক তালিকা থেকে আলাদা সংরক্ষিত থাকে।',
'Personal counting aid only; ask a qualified scholar about calculating and prioritising missed prayers.':'এটি শুধু ব্যক্তিগত গণনার সহায়ক; ছুটে যাওয়া নামাজের হিসাব ও অগ্রাধিকার সম্পর্কে যোগ্য আলেমের কাছে জিজ্ঞাসা করুন।',
'Qaza plan':'কাযা পরিকল্পনা','Owed':'বাকি আছে','Done ':'আদায়','Remaining':'অবশিষ্ট','Total remaining':'মোট অবশিষ্ট','Set how many prayers you need to make up. Choosing “Qaza” as the place on the Salah screen counts automatically.':'কতগুলো নামাজ কাযা আদায় করতে হবে তা লিখুন। নামাজ স্ক্রিনে স্থান হিসেবে “কাযা” বাছাই করলে স্বয়ংক্রিয়ভাবে গণনা হবে।',
/* dhikr */
'REMEMBRANCE OF ALLAH':'আল্লাহর স্মরণ','Dhikr counter':'যিকির কাউন্টার',"TODAY'S RECITATIONS":'আজকের তিলাওয়াত','Daily targets':'দৈনিক লক্ষ্য','Tap to edit':'এডিট করতে ট্যাপ করুন',
'Set a daily recitation target for each dhikr. Your progress ring uses the combined targets.':'প্রতিটি যিকিরের জন্য দৈনিক লক্ষ্য ঠিক করুন। অগ্রগতি রিং সব লক্ষ্যের যোগফল ব্যবহার করে।',
'Add a personal dhikr':'নিজের যিকির যোগ করুন','Name of your dhikr':'যিকিরের নাম','Target updated':'লক্ষ্য হালনাগাদ হয়েছে','Tasbih mode':'তাসবীহ মোড','⛶ Tasbih':'⛶ তাসবীহ','Focus':'ফোকাস',
'SubhanAllah':'সুবহানাল্লাহ','Alhamdulillah':'আলহামদুলিল্লাহ','Allahu Akbar':'আল্লাহু আকবার','Astaghfirullah':'আস্তাগফিরুল্লাহ','La ilaha illallah':'লা ইলাহা ইল্লাল্লাহ','Durood Sharif':'দরুদ শরীফ','La hawla wa la quwwata illa billah':'লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ',
/* quran */
'DAILY RECITATION':'দৈনিক তিলাওয়াত','Quran tracker':'কুরআন ট্র্যাকার','Pages read today':'আজ পড়া পৃষ্ঠা','Surah / reading note':'সূরা / পড়ার নোট','Last ayah reached':'শেষ পড়া আয়াত','Daily page target':'দৈনিক পৃষ্ঠার লক্ষ্য','Save Quran progress':'কুরআনের অগ্রগতি সংরক্ষণ','Quran progress saved':'কুরআনের অগ্রগতি সংরক্ষিত','e.g. Al-Baqarah':'যেমন: আল-বাকারা','Ayah number':'আয়াত নম্বর',
'Khatam plan':'খতম পরিকল্পনা','Plan your khatam':'আপনার খতম পরিকল্পনা করুন','Pick a finish date and the app works out your daily pages.':'শেষ করার তারিখ বাছাই করুন, অ্যাপ প্রতিদিনের পৃষ্ঠা হিসাব করে দেবে।','Start a plan':'পরিকল্পনা শুরু করুন','Plan settings':'পরিকল্পনার সেটিং','Finish by':'শেষ তারিখ','Start date':'শুরুর তারিখ','Pages already read':'আগে পড়া পৃষ্ঠা','Save plan':'পরিকল্পনা সংরক্ষণ','Delete plan':'পরিকল্পনা মুছুন','Pages read':'পড়া পৃষ্ঠা','Pages left':'বাকি পৃষ্ঠা','Pages per day':'প্রতিদিন পৃষ্ঠা','Days left':'বাকি দিন','On track':'ঠিক পথে আছেন','Projected finish':'সম্ভাব্য শেষ','Set today’s target to':'আজকের লক্ষ্য ঠিক করুন','Last read':'শেষ পড়া','Khatam complete — alhamdulillah!':'খতম সম্পন্ন — আলহামদুলিল্লাহ!','Plan saved':'পরিকল্পনা সংরক্ষিত','Plan deleted':'পরিকল্পনা মুছে ফেলা হয়েছে','30 days':'৩০ দিন','60 days':'৬০ দিন','90 days':'৯০ দিন','1 year':'১ বছর','Quick set':'দ্রুত সেট',
/* azkar */
'DAILY REMEMBRANCE':'দৈনিক স্মরণ','Morning':'সকাল','Evening':'সন্ধ্যা','Before sleep':'ঘুমানোর আগে','Add your own':'নিজেরটি যোগ করুন','Your Azkar / remembrance':'আপনার আযকার / যিকির','＋ Add':'＋ যোগ','New Azkar will be added to the selected list.':'নতুন আযকার নির্বাচিত তালিকায় যোগ হবে।','Please enter an Azkar':'অনুগ্রহ করে একটি আযকার লিখুন',
'Ayat al-Kursi':'আয়াতুল কুরসি','Surah Al-Ikhlas (3 times)':'সূরা ইখলাস (৩ বার)','Surah Al-Falaq (3 times)':'সূরা ফালাক (৩ বার)','Surah An-Nas (3 times)':'সূরা নাস (৩ বার)','Sayyidul Istighfar':'সাইয়্যিদুল ইস্তিগফার','SubhanAllahi wa bihamdihi (100 times)':'সুবহানাল্লাহি ওয়া বিহামদিহি (১০০ বার)','Morning remembrance duas':'সকালের যিকিরের দোয়া','Amsayna wa amsal-mulku lillah':'আমসাইনা ওয়া আমসাল মুলকু লিল্লাহ','Evening remembrance duas':'সন্ধ্যার যিকিরের দোয়া','Last two verses of Surah Al-Baqarah':'সূরা বাকারার শেষ দুই আয়াত','Surah Al-Ikhlas, Al-Falaq & An-Nas':'সূরা ইখলাস, ফালাক ও নাস','Tasbih: SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34':'তাসবীহ: সুবহানাল্লাহ ৩৩, আলহামদুলিল্লাহ ৩৩, আল্লাহু আকবার ৩৪','Dua before sleeping':'ঘুমানোর আগের দোয়া',
'A simple personal checklist. Wording and counts vary by authentic narration — consult a reliable Hisnul Muslim or scholar for full texts.':'এটি একটি সহজ ব্যক্তিগত তালিকা। বিশুদ্ধ বর্ণনাভেদে শব্দ ও সংখ্যা ভিন্ন হতে পারে — পূর্ণ পাঠের জন্য নির্ভরযোগ্য হিসনুল মুসলিম বা আলেমের সাহায্য নিন।',
/* duas */
'QURANIC SUPPLICATIONS':'কুরআনের দোয়া','Dua collection':'দোয়া সংকলন','A small collection of Quranic duas with meanings and references. Check a trusted translation for fuller context.':'অর্থ ও সূত্রসহ কুরআনের কিছু দোয়ার ছোট সংকলন। পূর্ণ প্রসঙ্গের জন্য নির্ভরযোগ্য অনুবাদ দেখুন।',
/* times */
'LOCAL PRAYER SCHEDULE':'স্থানীয় নামাজের সময়সূচি','↻ Refresh':'↻ রিফ্রেশ','Fetching prayer times…':'নামাজের সময় আনা হচ্ছে…','Location & method':'অবস্থান ও পদ্ধতি','City':'শহর','Country':'দেশ','Calculation method':'গণনা পদ্ধতি','Save location & update times':'অবস্থান সংরক্ষণ ও সময় হালনাগাদ',
'Karachi':'করাচি','Muslim World League':'মুসলিম ওয়ার্ল্ড লীগ','ISNA':'আইএসএনএ','Egyptian':'মিশরীয়','Umm Al-Qura':'উম্মুল কুরা',
'Prayer reminders':'নামাজের রিমাইন্ডার','Enable notifications':'নোটিফিকেশন চালু করুন','Remind me at prayer times while app is open':'অ্যাপ খোলা থাকলে নামাজের সময় রিমাইন্ড করুন','Remind me':'আমাকে মনে করিয়ে দিন','At prayer time':'নামাজের সময়','5 minutes before':'৫ মিনিট আগে','10 minutes before':'১০ মিনিট আগে','15 minutes before':'১৫ মিনিট আগে','30 minutes before':'৩০ মিনিট আগে','Send test reminder':'পরীক্ষামূলক রিমাইন্ডার','Allow exact alarms':'নির্দিষ্ট সময়ের অ্যালার্ম অনুমতি',
'Reminders arrive even when the app is closed. Choose how early you want to be reminded.':'অ্যাপ বন্ধ থাকলেও রিমাইন্ডার আসবে। কত আগে মনে করাতে চান তা বাছাই করুন।','Reminders only work while the app is open. Install the Android app for reminders that work in the background.':'রিমাইন্ডার শুধু অ্যাপ খোলা থাকলে কাজ করে। ব্যাকগ্রাউন্ডে রিমাইন্ডারের জন্য অ্যান্ড্রয়েড অ্যাপ ইনস্টল করুন।','Reminders are off':'রিমাইন্ডার বন্ধ',
'Prayer reminders on':'নামাজের রিমাইন্ডার চালু','Reminders disabled':'রিমাইন্ডার বন্ধ','Notification permission was denied.':'নোটিফিকেশনের অনুমতি দেওয়া হয়নি।','Notifications allowed':'নোটিফিকেশন অনুমোদিত','Test reminder — it works!':'পরীক্ষামূলক রিমাইন্ডার — কাজ করছে!','Test reminder in a few seconds':'কয়েক সেকেন্ডের মধ্যে পরীক্ষামূলক রিমাইন্ডার আসবে','Could not send test':'পরীক্ষা পাঠানো যায়নি','Prayer times unavailable':'নামাজের সময় পাওয়া যায়নি',
'Notification permission was denied. Enable it in Android Settings → Apps → My Ibadah → Notifications.':'নোটিফিকেশনের অনুমতি দেওয়া হয়নি। অ্যান্ড্রয়েড সেটিংস → অ্যাপস → My Ibadah → নোটিফিকেশনে চালু করুন।','For on-time alerts, allow “Alarms & reminders” for My Ibadah.':'সঠিক সময়ে অ্যালার্টের জন্য My Ibadah-কে “Alarms & reminders” অনুমতি দিন।','Could not load prayer times for reminders. Connect to the internet once.':'রিমাইন্ডারের জন্য নামাজের সময় আনা যায়নি। একবার ইন্টারনেটে সংযুক্ত হন।','Could not schedule reminders.':'রিমাইন্ডার নির্ধারণ করা যায়নি।',
/* good deeds + reflection */
'SMALL DEEDS, CONSISTENTLY':'ছোট আমল, নিয়মিত','Tick the good deeds you completed today. This is a personal reflection tool, not a measure of anyone\'s worth.':'আজ যেসব সৎকাজ করেছেন সেগুলো টিক দিন। এটি ব্যক্তিগত আত্মসমালোচনার সহায়ক, কারও মূল্যের মাপকাঠি নয়।','A good deed to track':'ট্র্যাক করার মতো একটি সৎকাজ',
'Prayed on time':'সময়মতো নামাজ পড়েছি','Prayed in congregation':'জামাতে নামাজ পড়েছি','Read Quran':'কুরআন পড়েছি','Morning Azkar':'সকালের আযকার','Evening Azkar':'সন্ধ্যার আযকার','Made dua for parents':'পিতামাতার জন্য দোয়া করেছি','Helped someone':'কাউকে সাহায্য করেছি','Gave Sadaqah':'সদকা দিয়েছি','Maintained family ties':'আত্মীয়তার সম্পর্ক রক্ষা করেছি','Avoided backbiting':'গীবত থেকে বিরত থেকেছি',
'Daily reflection':'দৈনিক আত্মসমীক্ষা','Alhamdulillah for…':'আলহামদুলিল্লাহ, যার জন্য…','To improve tomorrow…':'আগামীকাল যা উন্নত করব…','Write a few words (private, saved on this device)':'কয়েকটি শব্দ লিখুন (ব্যক্তিগত, এই ডিভাইসে সংরক্ষিত)','Earlier reflections':'আগের আত্মসমীক্ষা','Grateful for':'কৃতজ্ঞ','To improve':'উন্নত করব','Reflection saved':'আত্মসমীক্ষা সংরক্ষিত',
/* reports */
'BUILD CONSISTENCY':'ধারাবাহিকতা গড়ুন','Progress':'অগ্রগতি','All prayers':'সব নামাজ','Some prayers':'কিছু নামাজ','Tap a day to edit':'এডিট করতে দিন ট্যাপ করুন','Fard completed this month':'এই মাসে ফরজ আদায়','Dhikr this month':'এই মাসে যিকির','Quran pages this month':'এই মাসে কুরআনের পৃষ্ঠা','Good deeds this month':'এই মাসে সৎকাজ','Export monthly report (CSV)':'মাসিক রিপোর্ট (CSV) এক্সপোর্ট','Progress is calculated from entries saved on this device.':'এই ডিভাইসে সংরক্ষিত এন্ট্রি থেকে অগ্রগতি হিসাব করা হয়।','Dhikr':'যিকির',
'Trends':'ধারা','12 weeks':'১২ সপ্তাহ','Prayers':'নামাজ','Best day':'সেরা দিন','Prayer consistency (last 30 days)':'নামাজের ধারাবাহিকতা (গত ৩০ দিন)','Needs attention':'মনোযোগ দরকার','Strongest':'সবচেয়ে ভালো','average':'গড়','Not enough data yet — keep logging!':'এখনো যথেষ্ট তথ্য নেই — লিখে রাখুন!','per day':'প্রতিদিন','Mon':'সোম','Tue':'মঙ্গল','Wed':'বুধ','Thu':'বৃহ','Fri':'শুক্র','Sat':'শনি','Sun':'রবি','MON':'সোম','TUE':'মঙ্গল','WED':'বুধ','THU':'বৃহ','FRI':'শুক্র','SAT':'শনি','SUN':'রবি',
/* streaks */
'day streak':'দিনের ধারা','Best':'সেরা','Complete all 5 prayers today to start a streak':'ধারা শুরু করতে আজ পাঁচ ওয়াক্তই আদায় করুন','Perfect week — mashaAllah!':'নিখুঁত সপ্তাহ — মাশাআল্লাহ!','Streak badges':'ধারার ব্যাজ','Last 7 days':'গত ৭ দিন','Backup reminder':'ব্যাকআপ স্মরণ',
/* ramadan */
'SPECIAL TRACKER':'বিশেষ ট্র্যাকার','Ramadan mode':'রমজান মোড','Track fasting and additional worship for the selected date.':'নির্বাচিত তারিখের রোজা ও অতিরিক্ত ইবাদত ট্র্যাক করুন।','Ramadan day':'রমজানের দিন','Suhoor completed':'সাহরি করেছি','Iftar completed':'ইফতার করেছি','Fasting':'রোজা','Not set':'ঠিক করা নেই','Yes':'হ্যাঁ','No':'না','Fasted':'রোজা রেখেছি','Not fasted':'রোজা রাখিনি','Excused':'অব্যাহতি',"Tarawih rak'ahs":'তারাবিহ রাকাত','Quran juz completed':'কুরআনের পারা সম্পন্ন','Save Ramadan entry':'রমজানের এন্ট্রি সংরক্ষণ','Ramadan entry saved':'রমজানের এন্ট্রি সংরক্ষিত','1–30':'১–৩০',
'Suhoor ends in':'সাহরি শেষ হতে','Iftar in':'ইফতার হতে','Iftar time has passed':'ইফতারের সময় পার হয়েছে','Next suhoor ends in':'পরবর্তী সাহরি শেষ হতে','Ramadan starts in':'রমজান শুরু হতে','days':'দিন','30-day fasting grid':'৩০ দিনের রোজার ছক','Ramadan starts on':'রমজান শুরু','Start date (1 Ramadan)':'শুরুর তারিখ (১ রমজান)','Auto-detected from the Umm al-Qura calendar. Adjust if your local moon-sighting differs.':'উম্মুল কুরা ক্যালেন্ডার থেকে স্বয়ংক্রিয়ভাবে নির্ধারিত। আপনার এলাকার চাঁদ দেখা ভিন্ন হলে পরিবর্তন করুন।','Make-up fasts owed':'কাযা রোজা বাকি','Juz completed':'পারা সম্পন্ন','Sehri / Iftar':'সাহরি / ইফতার','Fasted days':'রোজার দিন','Missed':'বাদ',
/* qibla */
'DIRECTION OF PRAYER':'নামাজের দিক','Qibla compass':'কিবলা কম্পাস','Qibla':'কিবলা','Qibla bearing':'কিবলার দিক','Distance to Makkah':'মক্কার দূরত্ব','You are facing':'আপনি মুখ করে আছেন','Start compass':'কম্পাস চালু করুন','Stop compass':'কম্পাস বন্ধ করুন','Use my GPS location':'আমার জিপিএস অবস্থান ব্যবহার করুন',
'Tap “Start compass”, then hold your phone flat and turn until the Kaaba icon points to the top arrow.':'“কম্পাস চালু করুন” ট্যাপ করুন, ফোন সমতলে ধরে কাবার চিহ্ন উপরের তীরের সাথে না মেলা পর্যন্ত ঘুরুন।','Hold your phone flat and turn until the Kaaba icon is under the top arrow. It turns green when aligned.':'ফোন সমতলে ধরে কাবার চিহ্ন উপরের তীরের নিচে না আসা পর্যন্ত ঘুরুন। ঠিক হলে সবুজ হবে।','Using':'ব্যবহৃত অবস্থান:','your GPS location':'আপনার জিপিএস অবস্থান','Location updated.':'অবস্থান হালনাগাদ হয়েছে।','Finding your location…':'আপনার অবস্থান খোঁজা হচ্ছে…','Could not get your location. Allow location access and try again.':'অবস্থান পাওয়া যায়নি। লোকেশন অনুমতি দিয়ে আবার চেষ্টা করুন।','Compass permission was denied.':'কম্পাসের অনুমতি দেওয়া হয়নি।','This device has no compass sensor. The Qibla bearing above is measured from true North.':'এই ডিভাইসে কম্পাস সেন্সর নেই। উপরের কিবলার দিক উত্তর থেকে মাপা।','No compass data received. Your phone may not have a magnetometer — use the bearing above with a physical compass.':'কম্পাসের তথ্য পাওয়া যায়নি। আপনার ফোনে ম্যাগনেটোমিটার নাও থাকতে পারে — উপরের দিক একটি আসল কম্পাসের সাথে ব্যবহার করুন।','Location unknown. Tap “Use my GPS location” or load prayer times once.':'অবস্থান অজানা। “জিপিএস অবস্থান ব্যবহার করুন” ট্যাপ করুন অথবা একবার নামাজের সময় লোড করুন।','Phone compasses can be off near metal or magnets. Move your phone in a figure-8 to calibrate, and compare with a known direction if possible.':'ধাতু বা চুম্বকের কাছে ফোনের কম্পাস ভুল দেখাতে পারে। ফোন ৮-এর মতো ঘুরিয়ে ক্যালিব্রেট করুন এবং সম্ভব হলে জানা কোনো দিকের সাথে মিলিয়ে নিন।',
/* settings */
'YOUR DATA & PREFERENCES':'আপনার তথ্য ও পছন্দ','Settings & backup':'সেটিংস ও ব্যাকআপ','Language':'ভাষা','Download backup':'ব্যাকআপ ডাউনলোড','Restore backup':'ব্যাকআপ পুনরুদ্ধার','Backup restored':'ব্যাকআপ পুনরুদ্ধার হয়েছে','Invalid backup file':'ব্যাকআপ ফাইলটি সঠিক নয়',
'Your records are stored in this browser on this device only. Export a backup regularly, especially before changing phones or clearing website data.':'আপনার তথ্য শুধু এই ডিভাইসের ব্রাউজারে সংরক্ষিত। বিশেষ করে ফোন বদলানো বা ওয়েবসাইট ডেটা মোছার আগে নিয়মিত ব্যাকআপ নিন।',
'Prayer times are supplied by AlAdhan and can differ by local mosque, calculation method and adjustments. Verify with your local mosque.':'নামাজের সময় AlAdhan থেকে নেওয়া এবং স্থানীয় মসজিদ, গণনা পদ্ধতি ও সমন্বয়ভেদে ভিন্ন হতে পারে। আপনার স্থানীয় মসজিদের সাথে মিলিয়ে নিন।',
'Danger zone':'বিপদ অঞ্চল','Permanently removes every record stored on this device.':'এই ডিভাইসে সংরক্ষিত সব তথ্য স্থায়ীভাবে মুছে ফেলে।','Delete all app data':'অ্যাপের সব তথ্য মুছুন','App data cleared':'অ্যাপের তথ্য মুছে ফেলা হয়েছে',
'Cloud backup':'ক্লাউড ব্যাকআপ','Back up to Google Drive / Files':'গুগল ড্রাইভ / ফাইলে ব্যাকআপ','Opens your phone’s share sheet — choose Google Drive, Files, email or WhatsApp.':'আপনার ফোনের শেয়ার শিট খুলবে — গুগল ড্রাইভ, ফাইল, ইমেইল বা হোয়াটসঅ্যাপ বাছাই করুন।','Last backup':'শেষ ব্যাকআপ','never':'কখনো না','Back up now':'এখনই ব্যাকআপ নিন','Later':'পরে','It has been a while since your last backup. Save a copy to Google Drive or Files so you never lose your records.':'শেষ ব্যাকআপের পর অনেক দিন হয়েছে। আপনার তথ্য হারানো এড়াতে গুগল ড্রাইভ বা ফাইলে একটি কপি রাখুন।','Backup ready':'ব্যাকআপ প্রস্তুত','Could not save file':'ফাইল সংরক্ষণ করা যায়নি',
/* more sheet & misc */
'Prayer times ':'নামাজের সময়','Ramadan':'রমজান','Settings & backup ':'সেটিংস ও ব্যাকআপ','Tasbih mode ':'তাসবীহ মোড','Saved privately on this device':'এই ডিভাইসে ব্যক্তিগতভাবে সংরক্ষিত',
'Tap anywhere to count':'গণনা করতে যেকোনো জায়গায় ট্যাপ করুন','↺ Reset':'↺ রিসেট','− Undo':'− পূর্বাবস্থা','Target reached':'লক্ষ্য পূর্ণ','✓ target reached':'✓ লক্ষ্য পূর্ণ','Close':'বন্ধ','Pick a finish date after the start date':'শুরুর তারিখের পরে শেষ তারিখ বাছাই করুন','Delete this khatam plan?':'এই খতম পরিকল্পনা মুছবেন?','Counted as Qaza':'কাযা হিসেবে গণনা হয়েছে','Subhanallah — keep it going!':'সুবহানাল্লাহ — চালিয়ে যান!','Fajr ':'ফজর','Maghrib ':'মাগরিব','days':'দিন','day':'দিন','pages':'পৃষ্ঠা','Back up now ':'এখনই ব্যাকআপ নিন','Notifications are not supported here':'এখানে নোটিফিকেশন সমর্থিত নয়','Notifications are not available':'নোটিফিকেশন পাওয়া যাচ্ছে না','ayah':'আয়াত','Count reset':'গণনা রিসেট হয়েছে','Reset this count to zero?':'এই গণনা শূন্য করবেন?',
};
const P=[
 [/^max (.+)$/,m=>`সর্বোচ্চ ${m[1]}`],
 [/^(.+) · 7 days$/,m=>`${m[1]} · ৭ দিন`],
 [/^New Azkar will be added to (morning|evening|sleep) list\.$/,m=>`নতুন আযকার ${({morning:'সকালের',evening:'সন্ধ্যার',sleep:'ঘুমের আগের'})[m[1]]} তালিকায় যোগ হবে।`],
 [/^(Fajr|Dhuhr|Asr|Maghrib|Isha) · (.+)$/,m=>`${tp(m[1])} · ${m[2]}`],
 [/^(\d+) prayers? without a place yet$/,m=>`${m[1]}টি নামাজের স্থান এখনো দেওয়া হয়নি`],
 [/^(\d+) of (\d+) completed$/,m=>`${m[2]} এর মধ্যে ${m[1]}টি সম্পন্ন`],
 [/^(\d+)\/5 prayers$/,m=>`${m[1]}/৫ ওয়াক্ত`],
 [/^Remaining: (\d+) prayers?$/,m=>`বাকি: ${m[1]}টি নামাজ`],
 [/^Remaining: ([\d,]+) pages?$/,m=>`বাকি: ${m[1]} পৃষ্ঠা`],
 [/^Remaining: ([\d,]+)$/,m=>`বাকি: ${m[1]}`],
 [/^([\d,]+)\/([\d,]+) recitations$/,m=>`${m[1]}/${m[2]} বার`],
 [/^([\d,]+) recitations$/,m=>`${m[1]} বার`],
 [/^(\d+)\/(\d+) pages$/,m=>`${m[1]}/${m[2]} পৃষ্ঠা`],
 [/^in (\d+)h (\d+)m$/,m=>`${m[1]}ঘ ${m[2]}মি পরে`],
 [/^in (\d+)m$/,m=>`${m[1]} মিনিট পরে`],
 [/^(\d+) more days? to the (\d+)-day badge$/,m=>`${m[2]} দিনের ব্যাজ পেতে আরও ${m[1]} দিন`],
 [/^(\d+)m$/,m=>`${m[1]} মিনিট`],
 [/^(.*)ayah (.+)$/,m=>`${m[1]}আয়াত ${m[2]}`],
 [/^(\d+) pages$/,m=>`${m[1]} পৃষ্ঠা`],
 [/^(\d+)h (\d+)m$/,m=>`${m[1]}ঘ ${m[2]}মি`],
 [/^(\d+) pages read today$/,m=>`আজ ${m[1]} পৃষ্ঠা পড়া হয়েছে`],
 [/^(\d+) of (\d+) pages \((\d+)%\)$/,m=>`${m[2]} এর মধ্যে ${m[1]} পৃষ্ঠা (${m[3]}%)`],
 [/^✓ Goal reached · (\d+) pages$/,m=>`✓ লক্ষ্য পূর্ণ · ${m[1]} পৃষ্ঠা`],
 [/^(\d+) day streak$/,m=>`${m[1]} দিনের ধারা`],
 [/^(\d+)-day$/,m=>`${m[1]} দিন`],
 [/^(.+) marked as done ✓$/,m=>`${tp(m[1])} সম্পন্ন হিসেবে চিহ্নিত ✓`],
 [/^(.+) cleared$/,m=>`${tp(m[1])} মুছে ফেলা হয়েছে`],
 [/^✓ (.+) target reached$/,m=>`✓ ${tp(m[1])} লক্ষ্য পূর্ণ`],
 [/^(.+) prayers$/,m=>`${tp(m[1])} নামাজ`],
 [/^(\d+) Rakat (Fard|Sunnah|Witr|Nafl)( \((before|after)\))?$/,m=>`${m[1]} রাকাত ${{Fard:'ফরজ',Sunnah:'সুন্নত',Witr:'বিতর',Nafl:'নফল'}[m[2]]}${m[4]?(m[4]==='before'?' (আগে)':' (পরে)'):''}`],
 [/^Day (\d+)$/,m=>`${m[1]} নং দিন`],
 [/^Ramadan Day (\d+)$/,m=>`রমজানের ${m[1]} তম দিন`],
 [/^(\d+) pages? today$/,m=>`আজ ${m[1]} পৃষ্ঠা`],
 [/^(\d+) days? left$/,m=>`${m[1]} দিন বাকি`],
 [/^(\d+) reminders scheduled$/,m=>`${m[1]}টি রিমাইন্ডার নির্ধারিত`],
 [/^(\d+)°? ahead$/,m=>`${m[1]} পৃষ্ঠা এগিয়ে`],
 [/^(\d+) behind$/,m=>`${m[1]} পৃষ্ঠা পিছিয়ে`],
 [/^(\d+) pages ahead$/,m=>`${m[1]} পৃষ্ঠা এগিয়ে`],
 [/^(\d+) pages behind$/,m=>`${m[1]} পৃষ্ঠা পিছিয়ে`],
 [/^🏅 (\d+)-day streak!$/,m=>`🏅 ${m[1]} দিনের ধারা!`],
 [/^Status: (.+) · Tarawih (\d+)$/,m=>`অবস্থা: ${m[1]} · তারাবিহ ${m[2]}`],
 [/^(.+) · (Method \d+)$/,m=>`${m[1]} · পদ্ধতি ${m[2].replace('Method ','')}`],
 [/^Next suhoor ends in (.+)$/,m=>`পরবর্তী সাহরি শেষ হতে ${m[1]}`],
 [/^Ramadan starts in (\d+) days$/,m=>`রমজান শুরু হতে ${m[1]} দিন`],
 [/^Last backup: (.+)$/,m=>`শেষ ব্যাকআপ: ${m[1]==='never'?'কখনো না':m[1]}`],
];
function tp(n){return ({Fajr:'ফজর',Dhuhr:'যোহর',Asr:'আসর',Maghrib:'মাগরিব',Isha:'ঈশা'})[n]||D[n]||n;}

function translate(src){
  const lead=(/^\s*/.exec(src)||[''])[0],trail=(/\s*$/.exec(src)||[''])[0],core=src.trim();
  if(!core)return src;
  let out=D[core];
  if(out===undefined){for(const [re,fn] of P){const m=core.match(re);if(m){out=fn(m);break;}}}
  if(out===undefined)out=core;
  return lead+toBnDigits(out)+trail;
}
const textRec=new WeakMap(),attrRec=new WeakMap(),ATTRS=['placeholder','aria-label','title'];
function skipNode(n){const p=n.parentElement;if(!p)return true;if(/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName))return true;if(p.closest('[lang="ar"],[dir="rtl"]'))return true;return false;}
function applyNode(n){
  const rec=textRec.get(n);
  if(lang==='en'){if(rec&&n.data===rec.out){n.data=rec.src;}textRec.delete(n);return;}
  if(skipNode(n))return;
  if(rec&&n.data===rec.out)return;
  const src=n.data,out=translate(src);textRec.set(n,{src,out});if(out!==src)n.data=out;
}
function applyAttrs(el){
  const rec=attrRec.get(el)||{};
  ATTRS.forEach(a=>{if(!el.hasAttribute(a))return;const cur=el.getAttribute(a);
    if(lang==='en'){if(rec[a]&&cur===rec[a].out)el.setAttribute(a,rec[a].src);delete rec[a];return;}
    if(rec[a]&&cur===rec[a].out)return;const out=translate(cur);rec[a]={src:cur,out};if(out!==cur)el.setAttribute(a,out);});
  attrRec.set(el,rec);
}
function walk(root){
  if(root.nodeType===3){applyNode(root);return;}
  if(root.nodeType!==1)return;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=tw.nextNode()))applyNode(n);
  if(root.hasAttribute)applyAttrs(root);root.querySelectorAll&&root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(applyAttrs);
}
let pending=new Set(),raf=0;
const mo=new MutationObserver(ms=>{
  ms.forEach(m=>{if(m.type==='characterData')pending.add(m.target);else if(m.type==='attributes')pending.add(m.target);else m.addedNodes.forEach(x=>pending.add(x));});
  if(!raf)raf=requestAnimationFrame(()=>{raf=0;const items=[...pending];pending=new Set();mo.disconnect();items.forEach(x=>{if(x.nodeType===1&&!x.isConnected)return;if(x.nodeType===3)applyNode(x);else if(x.nodeType===1){walk(x);}});observe();});
});
function observe(){mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});}

/* Bangla dates & numbers for dates produced with toLocaleDateString(undefined, …) */
const _tlds=Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString=function(loc,opt){return _tlds.call(this,(loc===undefined&&lang==='bn')?'bn-BD':loc,opt);};

function fixHijri(){
  const el=document.getElementById('hijriDate');if(!el||lang!=='bn')return;
  try{const d=new Date((typeof selectedDate!=='undefined'?selectedDate:'')+'T12:00:00');if(isNaN(d))return;el.textContent=new Intl.DateTimeFormat('bn-BD-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(d);}catch{}
}
function setLang(l){
  lang=l==='bn'?'bn':'en';try{localStorage.setItem('myIbadah.lang',lang);}catch{}
  document.documentElement.lang=lang;mo.disconnect();walk(document.body);observe();
  const b=document.getElementById('langBtn');if(b)b.textContent=lang==='bn'?'English':'বাংলা';
  document.querySelectorAll('#langSeg button').forEach(x=>x.classList.toggle('active',x.dataset.lang===lang));
  document.title=lang==='bn'?'আমার ইবাদত — দৈনিক ইবাদত':'My Ibadah — Daily Worship';
  if(typeof renderAll==='function'){try{renderAll();}catch{}}
  fixHijri();
  window.dispatchEvent(new Event('langchange'));
}
window.I18N={get:()=>lang,set:setLang,t:s=>lang==='bn'?translate(s):s,fixHijri};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#langBtn');if(b)setLang(lang==='bn'?'en':'bn');const s=e.target.closest&&e.target.closest('#langSeg button');if(s)setLang(s.dataset.lang);});
setLang(lang);
})();
