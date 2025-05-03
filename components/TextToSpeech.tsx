"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Download, Pause, Play, RotateCcw, Globe, Mic, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Voice {
  name: string
  lang: string
  voiceURI: string
}

// Language options with flags and names
const languages = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
]

export default function TextToSpeech() {
  const [text, setText] = useState("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US")
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([])
  const [activeTab, setActiveTab] = useState("text")

  const synth = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis and load available voices
  useEffect(() => {
    synth.current = window.speechSynthesis

    const loadVoices = () => {
      const availableVoices = synth.current?.getVoices() || []
      const voiceList: Voice[] = availableVoices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI,
      }))
      setVoices(voiceList)
    }

    // Load voices initially and when they change
    loadVoices()
    if (synth.current) {
      synth.current.onvoiceschanged = loadVoices
    }

    return () => {
      if (synth.current?.speaking) {
        synth.current.cancel()
      }
    }
  }, [])

  // Filter voices by selected language
  useEffect(() => {
    const langVoices = voices.filter((voice) => voice.lang.startsWith(selectedLanguage.split("-")[0]))
    setFilteredVoices(langVoices)
    if (langVoices.length > 0 && !langVoices.some((v) => v.voiceURI === selectedVoice)) {
      setSelectedVoice(langVoices[0].voiceURI)
    }
  }, [selectedLanguage, voices, selectedVoice])

  const handleSpeak = () => {
    if (synth.current?.speaking) {
      if (isPaused) {
        synth.current.resume()
        setIsPaused(false)
      } else {
        synth.current.pause()
        setIsPaused(true)
      }
      return
    }

    if (text) {
      const utterance = new SpeechSynthesisUtterance(text)

      // Set voice if available
      if (selectedVoice) {
        const voiceObj = synth.current?.getVoices().find((v) => v.voiceURI === selectedVoice)
        if (voiceObj) utterance.voice = voiceObj
      }

      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.lang = selectedLanguage

      // Create audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const mediaStreamDestination = audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        setAudioBlob(audioBlob)
      }

      mediaRecorder.start()

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        mediaRecorder.stop()
      }
      utterance.onpause = () => setIsPaused(true)
      utterance.onresume = () => setIsPaused(false)

      utteranceRef.current = utterance
      synth.current?.speak(utterance)
    }
  }

  const handleStop = () => {
    synth.current?.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = "speech.wav"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text to Speech</CardTitle>
        <CardDescription>Convert text to natural-sounding speech with customizable voices</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span>Voice</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Language</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Enter Text</Label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="rate-slider">Rate: {rate.toFixed(1)}</Label>
                </div>
                <Slider
                  id="rate-slider"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[rate]}
                  onValueChange={(value) => setRate(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pitch-slider">Pitch: {pitch.toFixed(1)}</Label>
                </div>
                <Slider
                  id="pitch-slider"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[pitch]}
                  onValueChange={(value) => setPitch(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="volume-slider">Volume: {volume.toFixed(1)}</Label>
                </div>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Select Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-select">Select Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={filteredVoices.length === 0}>
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder={filteredVoices.length === 0 ? "No voices available" : "Select a voice"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVoices.map((voice) => (
                      <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-center space-x-4">
          <Button onClick={handleSpeak} disabled={!text} className="flex items-center gap-2" variant="default">
            {isSpeaking ? isPaused ? <Play size={16} /> : <Pause size={16} /> : <Play size={16} />}
            {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Speak"}
          </Button>

          <Button onClick={handleStop} disabled={!isSpeaking} variant="destructive" className="flex items-center gap-2">
            <RotateCcw size={16} />
            Stop
          </Button>

          <Button onClick={handleDownload} disabled={!audioBlob} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Download
          </Button>
        </div>

        {isSpeaking && (
          <motion.div
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-6 bg-primary rounded-full"
                animate={{
                  height: ["24px", "12px", "24px"],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </CardFooter>
    </Card>
  )
}
