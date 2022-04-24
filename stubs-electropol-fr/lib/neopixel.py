# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from microbit import _Pin


class NeoPixel(list):
    def __init__(self, broche: _Pin, n: int) -> None:
        """
        Crée une liste représentant une bande de 'n' néopixels contrôlés à partir de
        la broche spécifiée (par exemple microbit.pin0).
        Utilisez l'objet résultant pour changer chaque pixel en fonction de sa position
        (en commençant de 0).
        Les pixels individuels reçoivent des valeurs RVB (rouge, vert, bleu) entre
        0-255 (tuple).
        Par exemple :
            np = neopixel.NeoPixel(microbit.pin0, 3)
            np[0] = (255, 0, 128)
            np[1] = (255, 255, 0)
            np[2] = (0, 0, 128)
            np.show()
        """
        pass

    def clear(self) -> None:
        """
        Effacez tous les pixels.
        """
        pass

    def show(self) -> None:
        """
        Allume les pixels. Dois être appelé pour que les mises à jour deviennent visibles.
        """
        pass
