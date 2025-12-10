import torch
import torch.nn as nn


class DeepBlock(nn.Module):
    """
    A deeper version of your original Block.
    Contains TWO Conv layers instead of one.
    Works for both downsampling and upsampling.
    """
    def __init__(self, in_channels, out_channels, down=True, act="relu", use_dropout=False):
        super().__init__()

        self.down = down
        
        # First convolution
        if down:
            self.conv1 = nn.Conv2d(in_channels, out_channels, 4, 2, 1, padding_mode="reflect")
        else:
            self.conv1 = nn.ConvTranspose2d(in_channels, out_channels, 4, 2, 1)
        
        # Second convolution (same resolution)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, padding_mode="reflect")

        # Normalization layers
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # Activation
        self.activation = nn.ReLU() if act == "relu" else nn.LeakyReLU(0.2)

        # Optional dropout
        self.use_dropout = use_dropout
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.activation(self.bn1(self.conv1(x)))
        x = self.activation(self.bn2(self.conv2(x)))

        if self.use_dropout:
            x = self.dropout(x)

        return x


class Generator(nn.Module):
    """
    U-Net Generator with deeper convolutional blocks.
    Fully compatible with Pix2Pix-style training.
    """
    def __init__(self, in_channels=3, features=64):
        super().__init__()

        self.initial_down = nn.Sequential(
            nn.Conv2d(in_channels, features, 4, 2, 1, padding_mode="reflect"),
            nn.LeakyReLU(0.2),
        )

        # Encoder
        self.down1 = DeepBlock(features, features * 2, down=True, act="leaky")
        self.down2 = DeepBlock(features * 2, features * 4, down=True, act="leaky")
        self.down3 = DeepBlock(features * 4, features * 8, down=True, act="leaky")
        self.down4 = DeepBlock(features * 8, features * 8, down=True, act="leaky")
        self.down5 = DeepBlock(features * 8, features * 8, down=True, act="leaky")
        self.down6 = DeepBlock(features * 8, features * 8, down=True, act="leaky")

        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(features * 8, features * 8, 4, 2, 1),
            nn.ReLU()
        )

        # Decoder
        self.up1 = DeepBlock(features * 8, features * 8, down=False, use_dropout=False)
        self.up2 = DeepBlock(features * 8 * 2, features * 8, down=False, use_dropout=False)
        self.up3 = DeepBlock(features * 8 * 2, features * 8, down=False, use_dropout=False)
        self.up4 = DeepBlock(features * 8 * 2, features * 8, down=False)
        self.up5 = DeepBlock(features * 8 * 2, features * 4, down=False)
        self.up6 = DeepBlock(features * 4 * 2, features * 2, down=False)
        self.up7 = DeepBlock(features * 2 * 2, features, down=False)

        # Final output
        self.final_up = nn.Sequential(
            nn.ConvTranspose2d(features * 2, in_channels, kernel_size=4, stride=2, padding=1),
            nn.Tanh(),
        )

    def forward(self, x):
        d1 = self.initial_down(x)
        d2 = self.down1(d1)
        d3 = self.down2(d2)
        d4 = self.down3(d3)
        d5 = self.down4(d4)
        d6 = self.down5(d5)
        d7 = self.down6(d6)

        bottleneck = self.bottleneck(d7)

        up1 = self.up1(bottleneck)
        up2 = self.up2(torch.cat([up1, d7], 1))
        up3 = self.up3(torch.cat([up2, d6], 1))
        up4 = self.up4(torch.cat([up3, d5], 1))
        up5 = self.up5(torch.cat([up4, d4], 1))
        up6 = self.up6(torch.cat([up5, d3], 1))
        up7 = self.up7(torch.cat([up6, d2], 1))

        return self.final_up(torch.cat([up7, d1], 1))
