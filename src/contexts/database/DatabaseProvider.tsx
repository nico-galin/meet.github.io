import React, { useCallback, useEffect, useState } from 'react'
import useLocalStorage from 'hooks/useLocalStorage'
import DatabaseContext, { ResidenceUpdateProps } from './DatabaseContext'
import Residence, { Resident } from 'models/Residence';
import { Meetup } from 'models/Meetup';

import { getFirestore, doc, setDoc, addDoc, collection, getDocs, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; 
import { getFutureDate, hashGroupChat, hashResidence } from 'hooks/utils';
import useAuth from 'contexts/auth/useAuth';
import GroupChat from 'models/GroupChat';

const db = getFirestore();

const DatabaseProvider = (props: any) => {
  const [loading, setLoading] = useState(true);
  const [residences, setResidences] = useState({});
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const { user, isAuthenticated } = useAuth();

  const residenceDoc = `residences`

  const addResidence = async (residence: Residence) => {
    if (!isAuthenticated || !user) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      const id: string = await hashResidence(residence);
      residence.group_chats = residence.group_chats.map(gc => ({ ...gc, residenceId: id}))
      const uploadGCIDs = await Promise.all(residence.group_chats.map(gc => hashGroupChat(gc)))
      residence.group_chats = residence.group_chats.map((gc, ind) => ({ ...gc, id: uploadGCIDs[ind], expiration: getFutureDate(6).toISOString()}))

      const resp = await setDoc(doc(db, residenceDoc, id), {
        ...residence,
        id,
        photo_uri: "",
        current_residents: [],
        past_residents: [],
        pending_review: true,
        creatorId: user?.id,
      });
      refreshResidences();
      return resp;
    } catch (e) {
      console.log(e, residence);
    }
  }

  const addGroupChat = async (gc: GroupChat) => {
    if (!isAuthenticated || !user) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      console.log(gc)
      gc.id = await hashGroupChat(gc);
      gc.expiration = getFutureDate(6).toISOString()
      const res = await updateDoc(doc(db, residenceDoc, gc.residenceId), {
        group_chats: arrayUnion(gc)
      });
      refreshResidences();
      return res;
    } catch (e) {
      console.log(e, gc)
    }
  }

  const deleteGroupChat = async (gc: GroupChat) => {
    if (!isAuthenticated || !user) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      const res = await updateDoc(doc(db, residenceDoc, gc.residenceId), {
        regions: arrayRemove(gc)
      });
      refreshResidences();
      return res;
    } catch (e) {
      console.log(e, gc)
    }
  }

  const deleteResidence = async (residence: Residence) => {
    if (!isAuthenticated) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      const res = deleteDoc(doc(db, residenceDoc, residence.id));
      refreshResidences();
      return res;
    } catch (e) {
      console.log(e, residence);
    }
  }

  const updateResidence = async ({ id, options }: ResidenceUpdateProps) => {
    if (!isAuthenticated) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {

    } catch (e) {
      console.log(e, id, options)
    }
  }

  const refreshResidences = async () => {
    const querySnapshot = await getDocs(collection(db, residenceDoc));
    setResidences(querySnapshot.docs.map(e => e.data() as Residence));
    const newRes: {[key: string]: any} = {};
    querySnapshot.forEach(doc => {
      const r = doc.data();
      newRes[r.id] = r;
    })
    setResidences(newRes);
  }

  const refreshMeetups = async () => {
    setMeetups([]);
  }

  const joinResidence = async (residence: Residence, duration: number) => {
    if (!isAuthenticated) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      const person = {
        userId: user?.id,
        company_name: user?.company_name,
        expiration: getFutureDate(duration).toISOString()
      } as Resident
      const response0 = await updateDoc(doc(db, residenceDoc, residence.id), {
        current_residents: arrayUnion(person)
      });
      refreshResidences();
      const response1 = updateDoc(doc(db, residenceDoc, residence.id), {
        past_residents: arrayRemove({ userId: person.userId, company_name: person.company_name })
      });
      return response0;
    } catch (e) {
      console.log(e, residence)
    }
  }

  const leaveResidence = async (residence: Residence) => {
    if (!isAuthenticated) {
      console.log("[NOT AUTHENTICATED]")
      return;
    }
    try {
      const person = {
        userId: user?.id,
        company_name: user?.company_name,
        expiration: residence.current_residents.find(r => r.userId === user?.id)?.expiration
      } as Resident
      const response0 = await updateDoc(doc(db, residenceDoc, residence.id), {
        current_residents: arrayRemove(person)
      });
      refreshResidences();
      const response1 = updateDoc(doc(db, residenceDoc, residence.id), {
        past_residents: arrayUnion({ userId: person.userId, company_name: person.company_name })
      });
      return response0;
    } catch (e) {
      console.log(e, residence)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshResidences();
      setLoading(false);
    }
    init();
  }, [])

  return (
    <DatabaseContext.Provider
      value={{
        loading,
        residences,
        meetups,
        refreshResidences,
        refreshMeetups,
        addResidence,
        updateResidence,
        deleteResidence,

        joinResidence,
        leaveResidence,

        addGroupChat,
        deleteGroupChat
      }}
    >
      {props.children}
    </DatabaseContext.Provider>
  )
}

export default DatabaseProvider;