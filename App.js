import { StatusBar } from 'expo-status-bar';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { addDoc, collection, firestore, MESSAGES, serverTimestamp, query, onSnapshot, orderBy, deleteDoc, doc } from './firebase/Config';
import { useEffect, useState } from 'react';
import { convertFirebaseTimeStampToJS } from './helper/Functions';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const q = query(collection(firestore, MESSAGES),orderBy('created','desc'))
    const unsubscribe = onSnapshot(q,(querySnapshot) =>{
      const tempMessages = []
      querySnapshot.forEach((doc) => {
        tempMessages.push({...doc.data(),id: doc.id, created: convertFirebaseTimeStampToJS(doc.data().created)})
      })
      setMessages(tempMessages)
      console.log(tempMessages)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const save = async () => {
    const docRef = await addDoc(collection(firestore, MESSAGES), {
      text: newMessage,
      created: serverTimestamp()
    }).catch(error => console.log(error));
    setNewMessage('');
  };

  const delte = async (messageId) => {
    if (messageId) {
      const docRef = doc(firestore, MESSAGES, messageId);
      await deleteDoc(docRef).catch(error => console.log(error));
    }
  };

  return (
<SafeAreaView style={styles.container}>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder='Add item'
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <Button title='Add' onPress={save} />
      </View>
      <ScrollView style={styles.scrollView}>
        {messages.map((message) => (
          <View style={styles.message} key={message.id}>
            <Text style={styles.messageInfo}>{message.created}</Text>
            <Text>{message.text}</Text>
            <Button title='Delete' onPress={() => delte(message.id)} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 5,
  },
  messageInfo: {
    fontSize: 11,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 50,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
});

