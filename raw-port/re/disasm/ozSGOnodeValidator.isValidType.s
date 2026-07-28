__ZN18ozSGOnodeValidator11isValidTypeER11OZSceneNode:
00000000002d0ad0	pushq	%rbp
00000000002d0ad1	movq	%rsp, %rbp
00000000002d0ad4	pushq	%r14
00000000002d0ad6	pushq	%rbx
00000000002d0ad7	movq	%rdi, %rbx
00000000002d0ada	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000002d0ae1	leaq	__ZTI14OZFootageLayer(%rip), %rdx ## typeinfo for OZFootageLayer
00000000002d0ae8	xorl	%r14d, %r14d
00000000002d0aeb	xorl	%ecx, %ecx
00000000002d0aed	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000002d0af2	testq	%rax, %rax
00000000002d0af5	jne	0x2d0b76
00000000002d0af7	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000002d0afe	leaq	__ZTI12OZAudioLayer(%rip), %rdx ## typeinfo for OZAudioLayer
00000000002d0b05	xorl	%r14d, %r14d
00000000002d0b08	movq	%rbx, %rdi
00000000002d0b0b	xorl	%ecx, %ecx
00000000002d0b0d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000002d0b12	testq	%rax, %rax
00000000002d0b15	jne	0x2d0b76
00000000002d0b17	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000002d0b1e	leaq	__ZTI12OZAudioTrack(%rip), %rdx ## typeinfo for OZAudioTrack
00000000002d0b25	xorl	%r14d, %r14d
00000000002d0b28	movq	%rbx, %rdi
00000000002d0b2b	xorl	%ecx, %ecx
00000000002d0b2d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000002d0b32	testq	%rax, %rax
00000000002d0b35	jne	0x2d0b76
00000000002d0b37	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000002d0b3e	leaq	__ZTI7OZGroup(%rip), %rdx       ## typeinfo for OZGroup
00000000002d0b45	xorl	%r14d, %r14d
00000000002d0b48	movq	%rbx, %rdi
00000000002d0b4b	xorl	%ecx, %ecx
00000000002d0b4d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000002d0b52	testq	%rax, %rax
00000000002d0b55	jne	0x2d0b76
00000000002d0b57	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000002d0b5e	leaq	__ZTI18OZAudioMasterTrack(%rip), %rdx ## typeinfo for OZAudioMasterTrack
00000000002d0b65	movq	%rbx, %rdi
00000000002d0b68	xorl	%ecx, %ecx
00000000002d0b6a	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000002d0b6f	testq	%rax, %rax
00000000002d0b72	sete	%r14b
00000000002d0b76	movl	%r14d, %eax
00000000002d0b79	popq	%rbx
00000000002d0b7a	popq	%r14
00000000002d0b7c	popq	%rbp
00000000002d0b7d	retq
00000000002d0b7e	nop
