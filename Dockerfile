# Verktygsbilden för Ambrosiasorden: Hugo (fast version) + Python 3 med Pillow.
# Fungerar oförändrat med både docker och podman.
FROM python:3.15-slim

# Hugo-versionen anges på ETT ställe, här. Ändra och bygg om bilden för att uppdatera.
ARG HUGO_VERSION=0.170.1
ARG TARGETARCH

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl git libstdc++6 \
 && rm -rf /var/lib/apt/lists/* \
 && ARCH="${TARGETARCH:-$(dpkg --print-architecture)}" \
 && curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${ARCH}.tar.gz" -o /tmp/hugo.tgz \
 && tar -xzf /tmp/hugo.tgz -C /usr/local/bin hugo \
 && rm /tmp/hugo.tgz \
 && hugo version

RUN pip install --no-cache-dir Pillow==11.0.0

# git behöver acceptera den monterade katalogen (ägs av en annan användare i containern)
RUN git config --system --add safe.directory /site

WORKDIR /site
ENV HOME=/tmp
EXPOSE 1313
