__ZN20ozSelectAllValidator11isValidTypeER11OZSceneNode:
  146590:	55	pushq	%rbp
  146591:	48 89 e5	movq	%rsp, %rbp
  146594:	41 56	pushq	%r14
  146596:	53	pushq	%rbx
  146597:	48 89 fb	movq	%rdi, %rbx
  14659a:	48 8d 35 07 e3 6e 00	leaq	__ZTI11OZSceneNode(%rip), %rsi ## typeinfo for OZSceneNode
  1465a1:	48 8d 15 c8 12 71 00	leaq	__ZTI15OZSceneNodeFile(%rip), %rdx ## typeinfo for OZSceneNodeFile
  1465a8:	45 31 f6	xorl	%r14d, %r14d
  1465ab:	31 c9	xorl	%ecx, %ecx
  1465ad:	e8 5c 97 59 00	callq	0x6dfd0e ## symbol stub for: ___dynamic_cast
  1465b2:	48 85 c0	testq	%rax, %rax
  1465b5:	75 7f	jne	0x146636
  1465b7:	48 8d 35 ea e2 6e 00	leaq	__ZTI11OZSceneNode(%rip), %rsi ## typeinfo for OZSceneNode
  1465be:	48 8d 15 03 99 6f 00	leaq	__ZTI14OZFootageLayer(%rip), %rdx ## typeinfo for OZFootageLayer
  1465c5:	45 31 f6	xorl	%r14d, %r14d
  1465c8:	48 89 df	movq	%rbx, %rdi
  1465cb:	31 c9	xorl	%ecx, %ecx
  1465cd:	e8 3c 97 59 00	callq	0x6dfd0e ## symbol stub for: ___dynamic_cast
  1465d2:	48 85 c0	testq	%rax, %rax
  1465d5:	75 5f	jne	0x146636
  1465d7:	48 8d 35 ca e2 6e 00	leaq	__ZTI11OZSceneNode(%rip), %rsi ## typeinfo for OZSceneNode
  1465de:	48 8d 15 3b 91 6f 00	leaq	__ZTI12OZAudioLayer(%rip), %rdx ## typeinfo for OZAudioLayer
  1465e5:	45 31 f6	xorl	%r14d, %r14d
  1465e8:	48 89 df	movq	%rbx, %rdi
  1465eb:	31 c9	xorl	%ecx, %ecx
  1465ed:	e8 1c 97 59 00	callq	0x6dfd0e ## symbol stub for: ___dynamic_cast
  1465f2:	48 85 c0	testq	%rax, %rax
  1465f5:	75 3f	jne	0x146636
  1465f7:	48 8d 35 aa e2 6e 00	leaq	__ZTI11OZSceneNode(%rip), %rsi ## typeinfo for OZSceneNode
  1465fe:	48 8d 15 ab 2d 6f 00	leaq	__ZTI12OZAudioTrack(%rip), %rdx ## typeinfo for OZAudioTrack
  146605:	45 31 f6	xorl	%r14d, %r14d
  146608:	48 89 df	movq	%rbx, %rdi
  14660b:	31 c9	xorl	%ecx, %ecx
  14660d:	e8 fc 96 59 00	callq	0x6dfd0e ## symbol stub for: ___dynamic_cast
  146612:	48 85 c0	testq	%rax, %rax
  146615:	75 1f	jne	0x146636
  146617:	48 8d 35 8a e2 6e 00	leaq	__ZTI11OZSceneNode(%rip), %rsi ## typeinfo for OZSceneNode
  14661e:	48 8d 15 2b 82 6f 00	leaq	__ZTI18OZAudioMasterTrack(%rip), %rdx ## typeinfo for OZAudioMasterTrack
  146625:	48 89 df	movq	%rbx, %rdi
  146628:	31 c9	xorl	%ecx, %ecx
  14662a:	e8 df 96 59 00	callq	0x6dfd0e ## symbol stub for: ___dynamic_cast
  14662f:	48 85 c0	testq	%rax, %rax
  146632:	41 0f 94 c6	sete	%r14b
  146636:	44 89 f0	movl	%r14d, %eax
  146639:	5b	popq	%rbx
  14663a:	41 5e	popq	%r14
  14663c:	5d	popq	%rbp
  14663d:	c3	retq
  14663d:	c3	retq
