import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Gyroscope } from 'expo-sensors';

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        fontSize: 100,
        fontWeight: 'bold',
    },
});

export default function App() {
    const [mySound, setMySound] = useState(null);
    const [shakeDetected, setShakeDetected] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Function to play sound when shake is detected
    async function playSound() {
        const soundFile = require('./piano.wav');
        console.log("Playing sound...");
        const { sound } = await Audio.Sound.createAsync(
            soundFile,
            {},
            (status) => {
                if (!status.isPlaying) {
                    console.log("Sound has stopped");
                    setIsPlaying(false);
                }
            }
        );
        setMySound(sound);
        setIsPlaying(true);
        setShakeDetected(true);

        await sound.playAsync();


        setTimeout(() => {
            setShakeDetected(false);
        }, 4500);
    }

    const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 0 });
    const [lastTimestamp, setLastTimestamp] = useState(0);

    const detectShake = (acceleration) => {
        const { x, y, z } = acceleration;
        console.log(`Gyroscope Data: X: ${x}, Y: ${y}, Z: ${z}`);

        const currentTimestamp = Date.now();
        const timeDiff = currentTimestamp - lastTimestamp;

        const diffX = Math.abs(x - lastAcceleration.x);
        const diffY = Math.abs(y - lastAcceleration.y);
        const diffZ = Math.abs(z - lastAcceleration.z);

        if ((diffX > 1.0 || diffY > 1.0 || diffZ > 1.0) && timeDiff > 500) {
            console.log("Shake detected!");
            if (!isPlaying) {
                playSound();
            }
            setLastTimestamp(currentTimestamp);
        }
        setLastAcceleration({ x, y, z });
    };

    useEffect(() => {
        const subscription = Gyroscope.addListener(detectShake);

        Gyroscope.setUpdateInterval(100);

        return () => {
            subscription.remove();
        };
    }, [lastAcceleration, lastTimestamp]);

    useEffect(() => {
        return mySound
            ? () => {
                console.log('Unloading Sound');
                mySound.unloadAsync();
            }
            : undefined;
    }, [mySound]);

    return (
        <View style={styles.container}>
            <StatusBar />
            {shakeDetected && <Text style={styles.text}>SHAKE!</Text>}
        </View>
    );
}
