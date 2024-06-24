import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import axios from 'axios';



export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state




  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({base64: true});
      setPhotoUri(photo); // Set the photo URI to state
    }
  };

  const sendImage = async () => {
    setLoading(true);
    console.log(process.env.EXPO_PUBLIC_API_URL)
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/upload/`, {
        base64_string: photoUri.base64,
        filename: 'imageName.png',
        content_type: 'image/png',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Image has been uploaded successfully');
        setPhotoUri(null); // Reset the photo URI after successful upload
      } else {
        Alert.alert('Error', response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      console.error(error);
    }
   finally {
    setLoading(false); // Stop loading
  }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : photoUri ? (
        <View>
          <Image source={{ uri: photoUri.uri }} style={styles.image} />
          <TouchableOpacity style={styles.sendButton} onPress={sendImage}>
            <Text style={styles.text}>Send the Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={() => setPhotoUri(null)}>
            <Text style={styles.text}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} type={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  image: {
    width: '100%',
    height: '80%',
    contentFit: 'contain',
  },
  sendButton: {
    backgroundColor: 'green', // Change the color to your preference
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  retryButton: {
    backgroundColor: 'red', // Change the color to your preference
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
});