__ZN18OZChannelHistogram15getBlackInValueEiRK6CMTimed:
   705c4:	55	pushq	%rbp
   705c5:	48 89 e5	movq	%rsp, %rbp
   705c8:	83 fe 04	cmpl	$0x4, %esi
   705cb:	77 19	ja	0x705e6
   705cd:	69 c6 80 03 00 00	imull	$0x380, %esi, %eax
   705d3:	48 01 c7	addq	%rax, %rdi
   705d6:	48 81 c7 10 02 00 00	addq	$0x210, %rdi
   705dd:	48 89 d6	movq	%rdx, %rsi
   705e0:	5d	popq	%rbp
   705e1:	e9 68 57 fa ff	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
   705e6:	0f 57 c0	xorps	%xmm0, %xmm0
   705e9:	5d	popq	%rbp
   705ea:	c3	retq
   705eb:	90	nop
__ZN18OZChannelHistogram16getBlackOutValueEiRK6CMTimed:
   705ec:	55	pushq	%rbp
   705ed:	48 89 e5	movq	%rsp, %rbp
   705f0:	83 fe 04	cmpl	$0x4, %esi
   705f3:	77 19	ja	0x7060e
   705f5:	69 c6 80 03 00 00	imull	$0x380, %esi, %eax
   705fb:	48 01 c7	addq	%rax, %rdi
   705fe:	48 81 c7 a8 02 00 00	addq	$0x2a8, %rdi
   70605:	48 89 d6	movq	%rdx, %rsi
   70608:	5d	popq	%rbp
   70609:	e9 40 57 fa ff	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
   7060e:	0f 57 c0	xorps	%xmm0, %xmm0
   70611:	5d	popq	%rbp
   70612:	c3	retq
   70613:	90	nop
__ZN18OZChannelHistogram15getWhiteInValueEiRK6CMTimed:
   70614:	55	pushq	%rbp
   70615:	48 89 e5	movq	%rsp, %rbp
   70618:	83 fe 04	cmpl	$0x4, %esi
   7061b:	77 19	ja	0x70636
   7061d:	69 c6 80 03 00 00	imull	$0x380, %esi, %eax
   70623:	48 01 c7	addq	%rax, %rdi
   70626:	48 81 c7 40 03 00 00	addq	$0x340, %rdi
   7062d:	48 89 d6	movq	%rdx, %rsi
   70630:	5d	popq	%rbp
   70631:	e9 18 57 fa ff	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
   70636:	0f 57 c0	xorps	%xmm0, %xmm0
   70639:	5d	popq	%rbp
   7063a:	c3	retq
   7063b:	90	nop
__ZN18OZChannelHistogram16getWhiteOutValueEiRK6CMTimed:
   7063c:	55	pushq	%rbp
   7063d:	48 89 e5	movq	%rsp, %rbp
   70640:	83 fe 04	cmpl	$0x4, %esi
   70643:	77 19	ja	0x7065e
   70645:	69 c6 80 03 00 00	imull	$0x380, %esi, %eax
   7064b:	48 01 c7	addq	%rax, %rdi
   7064e:	48 81 c7 d8 03 00 00	addq	$0x3d8, %rdi
   70655:	48 89 d6	movq	%rdx, %rsi
   70658:	5d	popq	%rbp
   70659:	e9 f0 56 fa ff	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
   7065e:	0f 57 c0	xorps	%xmm0, %xmm0
   70661:	5d	popq	%rbp
   70662:	c3	retq
   70663:	90	nop
__ZN18OZChannelHistogram13getGammaValueEiRK6CMTimed:
   70664:	55	pushq	%rbp
   70665:	48 89 e5	movq	%rsp, %rbp
   70668:	83 fe 04	cmpl	$0x4, %esi
   7066b:	77 19	ja	0x70686
   7066d:	69 c6 80 03 00 00	imull	$0x380, %esi, %eax
   70673:	48 01 c7	addq	%rax, %rdi
   70676:	48 81 c7 70 04 00 00	addq	$0x470, %rdi
   7067d:	48 89 d6	movq	%rdx, %rsi
   70680:	5d	popq	%rbp
   70681:	e9 c8 56 fa ff	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
   70686:	0f 57 c0	xorps	%xmm0, %xmm0
   70689:	5d	popq	%rbp
   7068a:	c3	retq
   7068b:	90	nop
