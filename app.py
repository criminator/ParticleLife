import math
import pygame
import numpy
import random



pygame.init()

screen = pygame.display.set_mode((800, 800))

running = True

COLOR = {
    1: (255, 0, 0),
    2: (0, 255, 0),
    3: (0, 0, 255)
}

dt = 0.02
frictionHL = 0.04
frictionFactor = 0.5**(dt / frictionHL)
rMax = 100
m = 6
particles = []
forceFactor = 5

clock = pygame.time.Clock()

def force(r, a):
    BETA = 0.3
    if r < BETA:
        return r / BETA - 1
    elif BETA <= r and r <= 1:
        return a * (1 - abs(2 * r - 1 - BETA) / (1 - BETA))
    else:
        return 0

attraction = [
    [1, 0.2, 0],
    [0, 1, 0.2],
    [0.2, 0, 1]
    ]
class Particle:
    def __init__(self, type, position, velocity):
        self.type = type
        self.position = position
        self.velocity = velocity
    
    def draw(self, surface):
        pygame.draw.circle(surface, COLOR[self.type], self.position, 2)


    def update(self):
        totalForce = [0, 0]

        for j in particles:
            if j is self:
                continue

            rx = j.position[0] - self.position[0]
            ry = j.position[1] - self.position[1]
            r = math.sqrt(rx*rx + ry*ry)

            if 0 < r < rMax:
                a = attraction[self.type - 1][j.type - 1]
                f = force(r / rMax, a)
                totalForce[0] += (rx / r) * f
                totalForce[1] += (ry / r) * f

        totalForce[0] *= rMax * forceFactor
        totalForce[1] *= rMax * forceFactor

        self.velocity[0] *= frictionFactor
        self.velocity[1] *= frictionFactor

        self.velocity[0] += totalForce[0] * dt
        self.velocity[1] += totalForce[1] * dt

        self.position[0] += self.velocity[0] * dt
        self.position[1] += self.velocity[1] * dt

        self.position[0] = self.position[0] % 800
        self.position[1] = self.position[1] % 800


while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.MOUSEBUTTONDOWN:
            particles.append(Particle(random.randint(1, 3), [random.randint(0, 800), random.randint(0, 800)], [0, 0]))
    
    screen.fill((0, 0, 0))
    
    for particle in particles:
        particle.draw(screen)
        particle.update()

    pygame.display.flip()

    clock.tick(60)

pygame.quit()
    