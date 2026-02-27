import {
  addDoc, collection, doc, getCountFromServer, getDocs, increment, query, updateDoc, where
} from "firebase/firestore";
import { db } from "../../firebase";

export async function runDailyHit() {
  const date = new Date(new Date().getTime() + 7 * 60 * 1000 * 60);
  const formDocRef3 = collection(db, 'testing');

  // Check if today is a holiday
  const holidayCollection = collection(db, 'holiday');
  const dateForQuery = new Date(date);
  dateForQuery.setHours(0, 0, 0, 0);
  const holidayQuery = query(holidayCollection, where('date', '==', dateForQuery.toISOString()));
  const holidaySnapshot = await getDocs(holidayQuery);

  if (!holidaySnapshot.empty) {
    const autoTrigger4 = {
      turnaround: date.setHours(0, 0, 0, 0),
      note: 'daily hit - holiday',
      date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear(),
    };
    await addDoc(formDocRef3, autoTrigger4);
    return { status: true, autoTrigger4 };
  }

  if (date.getDay() !== 0 && date.getDay() !== 6) {
    const dateFormat = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    const dateFormat2 = date.getFullYear() + '-' + (date.getMonth() + 1);
    const dateFormat3 = date.getMonth() === 0
      ? date.getFullYear() - 1 + '-' + 12
      : date.getFullYear() + '-' + date.getMonth();

    const coll = collection(db, "auto_trigger");
    const q = query(coll, where('turnaround', '==', dateFormat));
    const snapshot = await getCountFromServer(q);

    if (snapshot.data().count === 0) {
      const formDocRef = collection(db, 'auto_trigger');
      const autoTrigger = {
        turnaround: dateFormat,
        daily: date.getTime(),
        note: 'daily hit',
        monthly: dateFormat
      };
      const queryCustomers = collection(db, 'customer');
      const querySnapshotCustomers = await getDocs(queryCustomers);

      await Promise.all(querySnapshotCustomers.docs.map(async (docu) => {
        const queryCustomersUpdate = doc(db, 'customer', docu.id);
        const docData = docu.data();
        if (docData[`history_package`]?.[dateFormat2] == null) {
          const doca = {
            [`history_package.${dateFormat2}.previous_team_id`]: [],
            ['active_plan_package_id']: dateFormat2,
            [`history_package.${dateFormat2}.team_id`]: docData[`history_package`]?.[dateFormat3]?.[`team_id`] ?? null,
            [`history_package.${dateFormat2}.account_manager`]: docData[`history_package`]?.[dateFormat3]?.[`account_manager`] ?? null,
            [`history_package.${dateFormat2}.graphic_ticket`]: 0,
            [`history_package.${dateFormat2}.graphic_time_spent`]: 0,
            [`history_package.${dateFormat2}.video_ticket`]: 0,
            [`history_package.${dateFormat2}.video_time_spent`]: 0,
            [`history_package.${dateFormat2}.website_ticket`]: 0,
            [`history_package.${dateFormat2}.website_time_spent`]: 0,
            [`history_package.${dateFormat2}.gbp_ticket`]: 0,
            [`history_package.${dateFormat2}.gbp_time_spent`]: 0,
            [`history_package.${dateFormat2}.video specialist_ticket`]: 0,
            [`history_package.${dateFormat2}.video specialist_time_spent`]: 0,
            [`history_package.${dateFormat2}.total_time_spent`]: 0,
            [`history_package.${dateFormat2}.work_days`]: 0,
          };
          await updateDoc(queryCustomersUpdate, doca);
        }
        if (docData.status === true) {
          await updateDoc(queryCustomersUpdate, {
            [`history_team.${dateFormat}`]: docData.active_team_id,
            [`history_time_package.${dateFormat}`]: docData.active_time_package,
            [`history_account_manager.${dateFormat}`]: docData.account_manager ?? null,
            [`history_package.${dateFormat2}.work_days`]: increment(1)
          });
        }
      }));

      await addDoc(formDocRef, autoTrigger);
    }
  }

  const formDocRef2 = collection(db, 'testing');
  const offsetDate = new Date(new Date().getTime() + 60 * 7 * 1000 * 60);
  const autoTrigger2 = {
    turnaround: new Date(offsetDate).setHours(0, 0, 0, 0),
    note: 'daily hit',
    date: offsetDate
  };
  await addDoc(formDocRef2, autoTrigger2);

  return { status: true, autoTrigger2 };
}
