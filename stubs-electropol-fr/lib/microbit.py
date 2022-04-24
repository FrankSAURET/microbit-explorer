# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from typing import (
    Any,
    List,
    NewType,
    Optional,
    Union,
    Tuple,
)

_UARTParity = NewType("_UARTParity", int)


def panic() -> None:
    """
    Met la micro:bit en mode panique et affichez un visage mécontent. Appuyer sur le bouton de réinitialisation pour quitter le mode panique.
    """
    pass


def sleep(durée: int) -> None:
    """
    Mettre la micro:bit en sommeil pour n millisecondes (1 seconde = 1000 ms). 
    """
    pass


def running_time() -> int:
    """
    Renvoie la durée en millisecondes depuis la dernière réinitialisation de micro:bit.
    """
    pass


def temperature() -> float:
    """
    Retourne la température en degrés Celsius.
    """
    pass


# Accelerometer 3D orientation
class _Accelerometer(object):
    def get_x(self) -> int:
        """
        Retourne l'accélération x en mg.
        """
        pass

    def get_y(self) -> int:
        """
        Retourne l'accélération y en mg.
        """
        pass

    def get_z(self) -> int:
        """
        Retourne l'accélération z en mg.
        Z est positif lors d'un mouvement vers le haut et négatif vers le bas
        """
        pass

    def is_gesture(self, nom: str) -> bool:
        """
        Retourne vrai ou faux pour indiquer si le geste nommé est actuellement 
        actif. 
        Micropython comprend les gestes suivants: 'up', 'down', 'left',
        'right', 'face up', 'face down', 'freefall', '3g', '6g', '8g' et
        'shake'.
        """
        pass

    def was_gesture(self, nom: str) -> bool:
        """
        Retourne vrai ou faux pour indiquer si le geste nommé était actif depuis 
        le dernier appel.
        Micropython comprend les gestes suivants: 'up', 'down', 'left',
        'right', 'face up', 'face down', 'freefall', '3g', '6g', '8g' et
        'shake'.
        """
        pass

    def get_gestures(self) -> List[str]:
        """
        Renvoie une liste indiquant l'historique des gestes. Le geste le plus
        récent est le dernier. 
        Appeler cette méthode efface également l'historique des gestes.
        Micropython comprend les gestes suivants: 'up', 'down', 'left',
        'right', 'face up', 'face down', 'freefall', '3g', '6g', '8g' et
        'shake'.
        """
        pass


accelerometer = _Accelerometer()


# Pushbutton
class _Button(object):
    def is_pressed(self) -> bool:
        """
        Si le bouton est enfoncé, is_pressed() est vrai, sinon faux.
        """
        pass

    def was_pressed(self) -> bool:
        """
        Utilisez was_pressed() pour savoir si le bouton a été pressé depuis la dernière
        fois que was_pressed() a été appelé. Renvoie Vrai ou Faux.
        """
        pass

    def get_presses(self) -> int:
        """
        Utilisez get_presses() pour obtenir le nombre total de pressions sur les boutons, et aussi
        remettre ce compteur à zéro.
        """
        pass


button_a = _Button()
button_b = _Button()


# Compass 3D direction heading
class _Compass(object):
    def is_calibrated(self) -> bool:
        """
        Si la boussole est calibrée, renvoie Vrai.
        Sinon, renvoie False.
        """
        pass

    def calibrate(self) -> None:
        """
        Calibre la boussole pour ajuster sa précision.
        Vous demandera de faire pivoter l'appareil pour dessiner un cercle sur l'écran.
        Ensuite, micro:bit saura où est le nord.
        """
        pass

    def clear_calibration(self) -> None:
        """
        Réinitialisez la boussole du micro:bit à l'aide de la commande clear_calibration().
        Exécutez calibrate() pour améliorer la précision.
        """
        pass

    def get_x(self) -> int:
        """
        Retourne le champ magnétique détecté sur l'axe X du micro:bit.
        En microtesla.
        """
        pass

    def get_y(self) -> int:
        """
        Retourne le champ magnétique détecté sur l'axe Y du micro:bit.
        En microtesla.
        """
        pass

    def get_z(self) -> int:
        """
        Retourne le champ magnétique détecté sur l'axe Z du micro:bit.
        En microtesla.
        """
        pass

    def get_field_strength(self) -> int:
        """
        Renvoie la force du champ magnétique autour de micro:bit.
        """
        pass

    def heading(self) -> int:
        """
        Renvoie un nombre compris entre 0 et 360 indiquant l'orientation de la carte. 
        0 pour le Nord.
        """
        pass


compass = _Compass()


# Display 5x5 LED grid
class _Display(object):
    def show(
        self,
        monImage: Union['Image', List['Image'], str],
        retard: int = 400,
        attendre: bool = True,
        boucle: bool = False,
        efface: bool = False,
    ) -> None:
        """
        Utilisez Show(monImage) pour afficher la chaîne ou l'image «monImage».
        Si «monImage» est une liste d'images, elles seront animées ensemble. 
        Utilisez le « retard » pour spécifier les modifications de la vitesse
        d'affichage en millisecondes. 
        Si attendre est faux, l'animation s'exécutera pendant que le programme
        continue.
        Si boucle est vrai, l'animation se répétera indéfiniment. 
        Si efface est vrai, l'écran s'éteindra à la fin de l'animation.
        """
        pass

    def scroll(
        self,
        maChaine: str,
        retard: int = 150,
        attendre: bool = True,
        boucle: bool = False,
        monospace: bool = False,
    ) -> None:
        """
        Utilisez Scroll(maChaine) pour faire défiler la chaîne sur l'afficheur. 
        Utilisez le retard pour contrôler la vitesse de défilement du texte.
        Si attendre est faux, le texte défilera pendant que le programme continue. 
        Si boucle est vrai, le texte se répétera pour toujours. 
        Si monospace est vrai, les caractères feront toujours 5 Pixels de large.
        """
        pass

    def clear(self) -> None:
        """
        Utilisez clear () pour effacer l'écran de la micro:bit.
        """
        pass

    def get_pixel(self, x: int, y: int) -> int:
        """
        get_pixel (x, y) renvoie la luminosité de la LED (x, y). 
         La luminosité peut être de 0 (LED éteinte) à 9 (luminosité maximale).
        """
        pass

    def set_pixel(self, x: int, y: int, l: int) -> None:
        """
        set_pixel (x, y, b) permet d'allumer la LED de coordonnées (x, y) à la
        luminosité « l » qui peut être réglé entre 0 (éteinte) à 9 (max).
        """
        pass

    def on(self) -> None:
        """
        Utilisez on() pour allumer l'affichage.
        """
        pass

    def off(self) -> None:
        """
        Utilisez off() pour éteindre l'affichage.
        """
        pass

    def is_on(self) -> bool:
        """
        Utiliser is_on() pour demander si l'affichage de la micro:bit est allumé (True) 
        ou éteint (False).
        """
        pass


display = _Display()


# Pins
class _Pin(object):
    """
    Une broche standard
    """
    def read_digital(self) -> int:
        """
        Lire la valeur numérique de la broche. 0 pour False, 1 pour True.
        """
        pass

    def write_digital(self, etat: int) -> None:
        """
        Mets la sortie à l'état haut si la etat est 1, ou à l'état bas si c'est 0.
        """
        pass


class _AnaloguePin(_Pin):
    """
    Ces broches sont pour la CAN et la MLI.
    """
    def read_analog(self) -> int:
        """
        Lire la tension appliquée à la broche.
        Renvoie la lecture sous la forme d'un nombre compris entre 0 (c'est-à-dire 0v) et 1023
        (signifiant 3,3v).
        """
        pass

    def write_analog(self, RC: int) -> None:
        """
        Émets un signal MLI sur la broche, avec le rapport cyclique proportionnel à la valeur fournie.
        La valeur peut être un nombre entier ou un nombre à virgule flottante entre 
        0 (rapport cyclique de 0 %) et 1023 (100%).
        """
        pass

    def set_analog_period(self, période: int) -> None:
        """
        Définissez la période du signal MLI en millisecondes. La valeur minimale valide est de 1 ms.
        """
        pass

    def set_analog_period_microseconds(self, période: int) -> None:
        """
        Définissez la période du signal MLI en microsecondes. La valeur minimale valide est de 256 µs.
        """
        pass


class _GiantPin(_AnaloguePin):
    """
    Ces broches sont disposées au bas de la carte et percées de trous.
    """
    def is_touched(self) -> bool:
        """
        Renvoie 1 si la broche est physiquement touchée sur la carte.
        """
        pass


pin0 = _GiantPin()
pin1 = _GiantPin()
pin2 = _GiantPin()
pin3 = _AnaloguePin()
pin4 = _AnaloguePin()
pin5 = _Pin()
pin6 = _Pin()
pin7 = _Pin()
pin8 = _Pin()
pin9 = _Pin()
pin10 = _AnaloguePin()
pin11 = _Pin()
pin12 = _Pin()
pin13 = _Pin()
pin14 = _Pin()
pin15 = _Pin()
pin16 = _Pin()
# Pin17 = 3v3
# Pin18 = 3v3
pin19 = _Pin()
pin20 = _Pin()
# pin21 = gnd
# pin22 = gnd
# V2
pin_logo = _GiantPin()
pin_speaker = _AnaloguePin()


# I2C
class _I2C(object):
    def read(self, addresse: int, n: int, répète: bool = False) -> bytes:
        """
        Lire 'n' octets du périphérique avec l'adresse sur 7 bits.
        Si répète est Vrai, aucun bit d'arrêt ne sera envoyé.
        """
        pass

    def write(self, adresse: int, buffer: bytes, répète: bool = False) -> None:
        """
        Écrire 'n' octets du périphérique avec l'adresse sur 7 bits.
        Si répète est Vrai, aucun bit d'arrêt ne sera envoyé.
        """
        pass

    def init(self, fréquence: int, scl: _Pin, sda: _Pin) -> None:
        """
        Définis la fréquence et les broches du bus.
        """
        pass


i2c = _I2C()


# Image
class Image(object):
    def __init__(self, *args: Any) -> None:
        """
        Il y a trois façons de construire une image
        Avec une chaîne :
            Image(
                '09090:'
                '99999:'
                '99999:'
                '09990:'
                '00900:'
            )
            Cela créerait une image en forme de cœur 5x5.
            Les chiffres vont de 0 (éteint) à 9 (le plus lumineux).
            Notez les deux-points ':' pour définir la fin d'une ligne. 
        Avec une largeur et une hauteur :
            Image(5, 5)
        Cela crée une image 5x5 vierge, que vous pouvez manipuler.
        On peut combiner les 2 :
            Image(5, 5, [
                0, 9, 0, 9, 0,
                9, 9, 9, 9, 9,
                9, 9, 9, 9, 9,
                0, 9, 9, 9, 0,
                0, 0, 9, 0, 0,
            ])
            Cela créerait l'image du cœur à partir de la première méthode.
        """

    def width(self) -> int:
        """
        Renvoie la largeur de l'image en pixels.
        """
        pass

    def height(self) -> int:
        """
        Renvoie la hauteur de l'image en pixels.
        """
        pass

    def get_pixel(self, x: int, y: int) -> int:
        """
        Renvoie la luminosité du point de coordonnées (x, y).
        La luminosité peut être comprise entre 0 (LED éteinte) et 9 (luminosité maximale).
        """
        pass

    def set_pixel(self, x: int, y: int, l: int) -> None:
        """
        Défini la luminosité du point de coordonnées (x, y).
        La luminosité peut être comprise entre 0 (LED éteinte) et 9 (luminosité maximale).
        """
        pass

    def shift_left(self, n: int) -> 'Image':
        """
        Fait une copie de l'image, mais déplacée de 'n' pixels vers la gauche.
        """
        pass

    def shift_right(self, n: int) -> 'Image':
        """
        Fait une copie de l'image, mais déplacée de 'n' pixels vers la droite.
        """
        pass

    def shift_up(self, n: int) -> 'Image':
        """
        Fait une copie de l'image, mais déplacée de 'n' pixels vers le haut.
        """
        pass

    def shift_down(self, n: int) -> 'Image':
        """
        Fait une copie de l'image, mais déplacée de 'n' pixels vers le bas.
        """
        pass

    def copy(self) -> 'Image':
        """
        Faire une copie de l'image.
        """
        pass

    def crop(self, x1: int, y1: int, x2: int, y2: int) -> 'Image':
        """
        Faites une copie découpée de l'image où
        la (x1,y1) est le coin supérieur gauche de la zone de découpe
        et (x2,y2) est le coin inférieur droit.
        """
        pass

    def invert(self) -> 'Image':
        """
        Faire une copie négative de l'image. Un pixel clair ou allumé dans 
        l'original devient sombre ou éteint dans la copie négative.
        """
        pass

    HEART = None  # type: Image
    HEART_SMALL = None  # type: Image
    HAPPY = None  # type: Image
    SMILE = None  # type: Image
    SAD = None  # type: Image
    CONFUSED = None  # type: Image
    ANGRY = None  # type: Image
    ASLEEP = None  # type: Image
    SURPRISED = None  # type: Image
    SILLY = None  # type: Image
    FABULOUS = None  # type: Image
    MEH = None  # type: Image
    YES = None  # type: Image
    NO = None  # type: Image
    CLOCK12 = None  # type: Image
    CLOCK11 = None  # type: Image
    CLOCK10 = None  # type: Image
    CLOCK9 = None  # type: Image
    CLOCK8 = None  # type: Image
    CLOCK7 = None  # type: Image
    CLOCK6 = None  # type: Image
    CLOCK5 = None  # type: Image
    CLOCK4 = None  # type: Image
    CLOCK3 = None  # type: Image
    CLOCK2 = None  # type: Image
    CLOCK1 = None  # type: Image
    ARROW_N = None  # type: Image
    ARROW_NE = None  # type: Image
    ARROW_E = None  # type: Image
    ARROW_SE = None  # type: Image
    ARROW_S = None  # type: Image
    ARROW_SW = None  # type: Image
    ARROW_W = None  # type: Image
    ARROW_NW = None  # type: Image
    TRIANGLE = None  # type: Image
    TRIANGLE_LEFT = None  # type: Image
    CHESSBOARD = None  # type: Image
    DIAMOND = None  # type: Image
    DIAMOND_SMALL = None  # type: Image
    SQUARE = None  # type: Image
    SQUARE_SMALL = None  # type: Image
    RABBIT = None  # type: Image
    COW = None  # type: Image
    MUSIC_CROTCHET = None  # type: Image
    MUSIC_QUAVER = None  # type: Image
    MUSIC_QUAVERS = None  # type: Image
    PITCHFORK = None  # type: Image
    XMAS = None  # type: Image
    PACMAN = None  # type: Image
    TARGET = None  # type: Image
    TSHIRT = None  # type: Image
    ROLLERSKATE = None  # type: Image
    DUCK = None  # type: Image
    HOUSE = None  # type: Image
    TORTOISE = None  # type: Image
    BUTTERFLY = None  # type: Image
    STICKFIGURE = None  # type: Image
    GHOST = None  # type: Image
    SWORD = None  # type: Image
    GIRAFFE = None  # type: Image
    SKULL = None  # type: Image
    UMBRELLA = None  # type: Image
    SNAKE = None  # type: Image
    ALL_CLOCKS = None  # type: List[Image]
    ALL_ARROWS = None  # type: List[Image]


# uart
class _UARTSerial(object):
    ODD = _UARTParity(1)
    EVEN = _UARTParity(0)

    def init(
        self,
        baudrate: int = 9600,
        bits: int = 8,
        parity: Optional[_UARTParity] = None,
        stop: int = 1,
        tx: Optional[_Pin] = None,
        rx: Optional[_Pin] = None,
    ) -> None:
        """
        Configure la communication en utilisant les valeurs par défaut.
        Sinon, remplacez les valeurs par défaut en tant qu'arguments nommés.
        """
        pass

    def any(self) -> bool:
        """
        S'il y a des caractères entrants en attente de lecture, any() renverra
        True, sinon, renvoie False.
        """
        pass

    def read(self, n: int) -> bytes:
        """
        Utilisez read() pour lire les caractères.
        Utilisez read(n) pour lire au maximum 'n' octets de données.
        """
        pass

    def readall(self) -> bytes:
        """
        Lire autant de données que possible.
        """
        pass

    def readline(self) -> bytes:
        """
        Lire une ligne qui se termine par un caractère de saut de ligne.
        """
        pass

    def readinto(self, buf: bytes, n: int) -> int:
        """
        Utilisez readinto(buf) pour lire des octets dans le tampon 'buf'.
        Utilisez readinto(buff, n) pour lire au maximum 'n' octets dans 'buf'.
        """
        pass

    def write(self, buf: bytes) -> int:
        """
        Utilisez write(buf) pour écrire les octets du tampon 'buf' sur le
        appareil.
        """
        pass


uart = _UARTSerial()


# SPI
class _SPISerial(object):
    def init(
        self,
        baudrate: int = 1000000,
        bits: int = 8,
        mode: int = 0,
        sclk: _Pin = pin13,
        mosi: _Pin = pin15,
        miso: _Pin = pin14,
    ) -> None:
        """
        Initialiser la communication. Remplacer les valeurs par défaut pour le 
        débit en bauds, le nombre de bit le mode, SCLK, MOSI et MISO. 
        """
        pass

    def write(self, buf: bytes) -> None:
        """
        Utilisez write(buf) pour écrire des octets dans le tampon 'buf' sur le périphérique connecté.
        """
        pass

    def read(self, n: int) -> bytes:
        """
        Utilisez read(n) pour lire 'n' octets de données.
        """
        pass

    def write_readinto(self, outbuf: bytes, inbuf: bytes) -> None:
        """
        Utilisez write_readinto(outbuf, inbuf) pour écrire le tampon 'outbuf' dans le
        périphérique connecté et lire toute réponse dans le tampon 'inbuf'. La longueur
        des tampons doit être la même. Les tampons peuvent être les mêmes objets.
        """
        pass


spi = _SPISerial()


# V2

# Built-in speaker
class _Speaker(object):
    def off(self) -> bool:
        """
        Éteind le haut-parleur. Cela ne désactive pas la sortie audio
        sur la broche du connecteur.
        """
        pass

    def on(self) -> bool:
        """
        Allume le haut-parleur.
        """
        pass


speaker = _Speaker()


# Built-in microphone
class _Microphone(object):
    def current_event(self) -> str:
        """
        Renvoie le nom du dernier événement sonore enregistré, SoundEvent('loud')
        ou SoundEvent('quiet').
        """
        pass

    def was_event(self, event: str) -> bool:
        """
        Event est un événement sonore tel que SoundEvent.LOUD ou SoundEvent.QUIET.
        Renvoie vrai si le son a été entendu au moins une fois depuis le dernier appel,
        sinon faux.
        La fonction efface également l'historique des événements sonores.
        """
        pass

    def is_event(self, event: str) -> bool:
        """
        Event est un événement sonore tel que SoundEvent.LOUD ou SoundEvent.QUIET.
        Renvoie vrai si l'événement sonore est le plus récent depuis le dernier appel,
        sinon faux.
        La fonction n'efface pas l'historique des événements sonores.
        """
        pass

    def get_events(self) -> Tuple[str, str]:
        """
        Renvoie un tuple de l'historique des événements. Le plus récent est listé 
        en dernier.
        La fonction efface également l'historique des événements sonores.
        """
        pass

    def set_threshold(
            self,
            event: str,
            value: int,
        ) -> Tuple[str, str]:
        """
        Un événement est un événement sonore, tel que SoundEvent.LOUD ou SoundEvent.QUIET.
        La valeur est le seuil dans la plage 0-255. Par exemple,
        set_threshold(SoundEvent.LOUD, 250) ne se déclenchera que si le son est
        très fort (>= 250).
        """
        pass

    def sound_level(self) -> int:
        """
        Renvoie une représentation du niveau de pression acoustique dans la plage 0
        à 255.
        """
        pass

microphone = _Microphone()
