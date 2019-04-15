<GameFile>
  <PropertyGroup Name="ApplyCloseUI" Type="Layer" ID="bcedc9d2-4df2-48d5-9a19-82b418fad36c" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Layer" Tag="439" ctype="GameLayerObjectData">
        <Size X="1280.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="applyclose_panel" ActionTag="-1498057888" Tag="496" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="148.0000" RightMargin="148.0000" TopMargin="45.0000" BottomMargin="45.0000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="80" RightEage="80" TopEage="80" BottomEage="80" Scale9OriginX="80" Scale9OriginY="80" Scale9Width="824" Scale9Height="470" ctype="PanelObjectData">
            <Size X="984.0000" Y="630.0000" />
            <Children>
              <AbstractNodeData Name="title_img" ActionTag="876694308" Tag="1667" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="403.0000" RightMargin="403.0000" TopMargin="14.8000" BottomMargin="569.2000" LeftEage="64" RightEage="64" TopEage="13" BottomEage="13" Scale9OriginX="64" Scale9OriginY="13" Scale9Width="50" Scale9Height="20" ctype="ImageViewObjectData">
                <Size X="178.0000" Y="46.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="492.0000" Y="592.2000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.9400" />
                <PreSize X="0.1809" Y="0.0730" />
                <FileData Type="Normal" Path="ApplyCloseUI/title.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="from_label" ActionTag="908175095" Tag="505" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="192.0000" RightMargin="192.0000" TopMargin="107.3500" BottomMargin="491.6500" IsCustomSize="True" FontSize="27" LabelText="玩家AAA申请解散房间，是否同意？" HorizontalAlignmentType="HT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="600.0000" Y="31.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="492.0000" Y="507.1500" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="158" G="66" B="26" />
                <PrePosition X="0.5000" Y="0.8050" />
                <PreSize X="0.6098" Y="0.0492" />
                <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="hint_label" ActionTag="-1915386969" VisibleForFrame="False" Tag="506" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="117.0000" RightMargin="117.0000" TopMargin="173.2210" BottomMargin="416.7790" IsCustomSize="True" FontSize="20" LabelText="三个或以上玩家同意即为通过，请你是否同意" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="750.0000" Y="40.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="492.0000" Y="436.7790" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.5000" Y="0.6933" />
                <PreSize X="0.7622" Y="0.0635" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="lefttime_label" ActionTag="-1952619367" Tag="509" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="117.0000" RightMargin="117.0000" TopMargin="439.9000" BottomMargin="150.1000" IsCustomSize="True" FontSize="25" LabelText="(90秒后默认同意)" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="750.0000" Y="40.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="492.0000" Y="170.1000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="169" G="111" B="89" />
                <PrePosition X="0.5000" Y="0.2700" />
                <PreSize X="0.7622" Y="0.0635" />
                <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="waiting_label" ActionTag="-1599212989" VisibleForFrame="False" Tag="508" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="142.0000" RightMargin="142.0000" TopMargin="502.9000" BottomMargin="87.1000" IsCustomSize="True" FontSize="26" LabelText="等待其他玩家选择..." HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="700.0000" Y="40.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="492.0000" Y="107.1000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="158" G="66" B="26" />
                <PrePosition X="0.5000" Y="0.1700" />
                <PreSize X="0.7114" Y="0.0635" />
                <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="yes_btn" ActionTag="-792967914" Tag="503" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="193.8000" RightMargin="538.2000" TopMargin="465.9000" BottomMargin="50.1000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="222" Scale9Height="92" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="252.0000" Y="114.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="319.8000" Y="107.1000" />
                <Scale ScaleX="0.8800" ScaleY="0.8800" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3250" Y="0.1700" />
                <PreSize X="0.2561" Y="0.1810" />
                <TextColor A="255" R="65" G="65" B="70" />
                <NormalFileData Type="Normal" Path="ApplyCloseUI/agree_btn.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="no_btn" ActionTag="-1362966716" Tag="504" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" PercentHeightEnable="True" PercentHeightEnabled="True" LeftMargin="535.7400" RightMargin="196.2600" TopMargin="465.8850" BottomMargin="50.0850" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="222" Scale9Height="92" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="252.0000" Y="114.0300" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="661.7400" Y="107.1000" />
                <Scale ScaleX="0.8800" ScaleY="0.8800" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6725" Y="0.1700" />
                <PreSize X="0.2561" Y="0.1810" />
                <TextColor A="255" R="65" G="65" B="70" />
                <NormalFileData Type="Normal" Path="ApplyCloseUI/refuse_btn.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="player_info_panel0" ActionTag="-390638497" Tag="5607" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="186.8000" RightMargin="531.2000" TopMargin="166.6000" BottomMargin="393.4000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="87" RightEage="87" TopEage="23" BottomEage="23" Scale9OriginX="87" Scale9OriginY="23" Scale9Width="92" Scale9Height="24" ctype="PanelObjectData">
                <Size X="266.0000" Y="70.0000" />
                <Children>
                  <AbstractNodeData Name="name_label" ActionTag="-139776347" Tag="5608" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="13.3000" RightMargin="92.7000" TopMargin="18.5000" BottomMargin="18.5000" IsCustomSize="True" FontSize="28" LabelText="一二三四五六七" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="160.0000" Y="33.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="13.3000" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="158" G="66" B="26" />
                    <PrePosition X="0.0500" Y="0.5000" />
                    <PreSize X="0.6015" Y="0.4714" />
                    <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="agree_img" ActionTag="1596992773" Tag="5609" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/agree.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="refuse_img" ActionTag="2023311112" VisibleForFrame="False" Tag="5610" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/refuse.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="unselect_img" ActionTag="-1133191978" VisibleForFrame="False" Tag="5611" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/unselect.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="319.8000" Y="428.4000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3250" Y="0.6800" />
                <PreSize X="0.2703" Y="0.1111" />
                <FileData Type="Normal" Path="ApplyCloseUI/frame.png" Plist="" />
                <SingleColor A="255" R="150" G="200" B="255" />
                <FirstColor A="255" R="150" G="200" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
              <AbstractNodeData Name="player_info_panel1" ActionTag="-2088307711" Tag="5612" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="529.7239" RightMargin="188.2761" TopMargin="166.6000" BottomMargin="393.4000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="87" RightEage="87" TopEage="23" BottomEage="23" Scale9OriginX="87" Scale9OriginY="23" Scale9Width="92" Scale9Height="24" ctype="PanelObjectData">
                <Size X="266.0000" Y="70.0000" />
                <Children>
                  <AbstractNodeData Name="name_label" ActionTag="-1847600565" Tag="5613" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="13.3000" RightMargin="92.7000" TopMargin="18.5000" BottomMargin="18.5000" IsCustomSize="True" FontSize="28" LabelText="一二三四五六七" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="160.0000" Y="33.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="13.3000" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="158" G="66" B="26" />
                    <PrePosition X="0.0500" Y="0.5000" />
                    <PreSize X="0.6015" Y="0.4714" />
                    <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="agree_img" ActionTag="-190184027" Tag="5614" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/agree.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="refuse_img" ActionTag="-1568707881" VisibleForFrame="False" Tag="5615" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/refuse.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="unselect_img" ActionTag="-1270657820" VisibleForFrame="False" Tag="5616" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/unselect.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="662.7239" Y="428.4000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6735" Y="0.6800" />
                <PreSize X="0.2703" Y="0.1111" />
                <FileData Type="Normal" Path="ApplyCloseUI/frame.png" Plist="" />
                <SingleColor A="255" R="150" G="200" B="255" />
                <FirstColor A="255" R="150" G="200" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
              <AbstractNodeData Name="player_info_panel2" ActionTag="1074047877" Tag="5617" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="186.8000" RightMargin="531.2000" TopMargin="261.1000" BottomMargin="298.9000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="87" RightEage="87" TopEage="23" BottomEage="23" Scale9OriginX="87" Scale9OriginY="23" Scale9Width="92" Scale9Height="24" ctype="PanelObjectData">
                <Size X="266.0000" Y="70.0000" />
                <Children>
                  <AbstractNodeData Name="name_label" ActionTag="-1819881314" Tag="5618" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="13.3000" RightMargin="92.7000" TopMargin="18.5000" BottomMargin="18.5000" IsCustomSize="True" FontSize="28" LabelText="一二三四五六七" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="160.0000" Y="33.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="13.3000" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="158" G="66" B="26" />
                    <PrePosition X="0.0500" Y="0.5000" />
                    <PreSize X="0.6015" Y="0.4714" />
                    <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="agree_img" ActionTag="-1055771366" Tag="5619" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/agree.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="refuse_img" ActionTag="1557572391" VisibleForFrame="False" Tag="5620" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/refuse.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="unselect_img" ActionTag="1336653957" VisibleForFrame="False" Tag="5621" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/unselect.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="319.8000" Y="333.9000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3250" Y="0.5300" />
                <PreSize X="0.2703" Y="0.1111" />
                <FileData Type="Normal" Path="ApplyCloseUI/frame.png" Plist="" />
                <SingleColor A="255" R="150" G="200" B="255" />
                <FirstColor A="255" R="150" G="200" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
              <AbstractNodeData Name="player_info_panel3" ActionTag="1418561436" Tag="5622" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="529.7239" RightMargin="188.2761" TopMargin="261.1000" BottomMargin="298.9000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="87" RightEage="87" TopEage="23" BottomEage="23" Scale9OriginX="87" Scale9OriginY="23" Scale9Width="92" Scale9Height="24" ctype="PanelObjectData">
                <Size X="266.0000" Y="70.0000" />
                <Children>
                  <AbstractNodeData Name="name_label" ActionTag="-427119703" Tag="5623" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="13.3000" RightMargin="92.7000" TopMargin="18.5000" BottomMargin="18.5000" IsCustomSize="True" FontSize="28" LabelText="一二三四五六七" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="160.0000" Y="33.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="13.3000" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="158" G="66" B="26" />
                    <PrePosition X="0.0500" Y="0.5000" />
                    <PreSize X="0.6015" Y="0.4714" />
                    <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="agree_img" ActionTag="284649894" Tag="5624" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/agree.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="refuse_img" ActionTag="-1960279894" VisibleForFrame="False" Tag="5625" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/refuse.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="unselect_img" ActionTag="-1705337001" VisibleForFrame="False" Tag="5626" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/unselect.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="662.7239" Y="333.9000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6735" Y="0.5300" />
                <PreSize X="0.2703" Y="0.1111" />
                <FileData Type="Normal" Path="ApplyCloseUI/frame.png" Plist="" />
                <SingleColor A="255" R="150" G="200" B="255" />
                <FirstColor A="255" R="150" G="200" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
              <AbstractNodeData Name="player_info_panel4" ActionTag="865925191" VisibleForFrame="False" Tag="112" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="186.8000" RightMargin="531.2000" TopMargin="355.6000" BottomMargin="204.4000" TouchEnable="True" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" LeftEage="87" RightEage="87" TopEage="23" BottomEage="23" Scale9OriginX="87" Scale9OriginY="23" Scale9Width="92" Scale9Height="24" ctype="PanelObjectData">
                <Size X="266.0000" Y="70.0000" />
                <Children>
                  <AbstractNodeData Name="name_label" ActionTag="-1967388430" Tag="113" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="13.3000" RightMargin="92.7000" TopMargin="18.5000" BottomMargin="18.5000" IsCustomSize="True" FontSize="28" LabelText="一二三四五六七" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="160.0000" Y="33.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="13.3000" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="158" G="66" B="26" />
                    <PrePosition X="0.0500" Y="0.5000" />
                    <PreSize X="0.6015" Y="0.4714" />
                    <FontResource Type="Normal" Path="font/zhunyuan.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="agree_img" ActionTag="1378481114" Tag="114" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/agree.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="refuse_img" ActionTag="1253865869" VisibleForFrame="False" Tag="115" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/refuse.png" Plist="" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="unselect_img" ActionTag="1521555597" VisibleForFrame="False" Tag="116" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="202.1600" RightMargin="21.8400" TopMargin="15.0000" BottomMargin="15.0000" LeftEage="13" RightEage="13" TopEage="13" BottomEage="13" Scale9OriginX="13" Scale9OriginY="13" Scale9Width="16" Scale9Height="14" ctype="ImageViewObjectData">
                    <Size X="42.0000" Y="40.0000" />
                    <AnchorPoint ScaleY="0.5000" />
                    <Position X="202.1600" Y="35.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.7600" Y="0.5000" />
                    <PreSize X="0.1579" Y="0.5714" />
                    <FileData Type="Normal" Path="ApplyCloseUI/unselect.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="319.8000" Y="239.4000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3250" Y="0.3800" />
                <PreSize X="0.2703" Y="0.1111" />
                <FileData Type="Normal" Path="ApplyCloseUI/frame.png" Plist="" />
                <SingleColor A="255" R="150" G="200" B="255" />
                <FirstColor A="255" R="150" G="200" B="255" />
                <EndColor A="255" R="255" G="255" B="255" />
                <ColorVector ScaleY="1.0000" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="640.0000" Y="360.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="0.5000" />
            <PreSize X="0.7688" Y="0.8750" />
            <FileData Type="Normal" Path="BackGround/small_win.png" Plist="" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>