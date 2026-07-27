__ZN15OZChannelBool3D8getValueERK6CMTimeP9PCVector3IdEd:
00000000000536b0	testq	%rdx, %rdx
00000000000536b3	je	0x5376b
00000000000536b9	pushq	%rbp
00000000000536ba	movq	%rsp, %rbp
00000000000536bd	pushq	%r15
00000000000536bf	pushq	%r14
00000000000536c1	pushq	%rbx
00000000000536c2	subq	$0x28, %rsp
00000000000536c6	movq	%rdx, %rbx
00000000000536c9	movq	%rsi, %r14
00000000000536cc	movq	%rdi, %r15
00000000000536cf	addq	$0x88, %rdi
00000000000536d6	movsd	%xmm0, -0x28(%rbp)
00000000000536db	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
00000000000536e0	movsd	0x5be40(%rip), %xmm0
00000000000536e8	movsd	%xmm0, -0x20(%rbp)
00000000000536ed	testl	%eax, %eax
00000000000536ef	jne	0x536f4
00000000000536f1	xorps	%xmm0, %xmm0
00000000000536f4	movsd	%xmm0, -0x38(%rbp)
00000000000536f9	leaq	0x120(%r15), %rdi
0000000000053700	movq	%r14, %rsi
0000000000053703	movsd	-0x28(%rbp), %xmm0
0000000000053708	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
000000000005370d	movsd	0x5be13(%rip), %xmm0
0000000000053715	testl	%eax, %eax
0000000000053717	jne	0x5371c
0000000000053719	xorps	%xmm0, %xmm0
000000000005371c	movsd	%xmm0, -0x30(%rbp)
0000000000053721	addq	$0x1b8, %r15                    ## imm = 0x1B8
0000000000053728	movq	%r15, %rdi
000000000005372b	movq	%r14, %rsi
000000000005372e	movsd	-0x28(%rbp), %xmm0
0000000000053733	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000053738	testl	%eax, %eax
000000000005373a	jne	0x53744
000000000005373c	xorps	%xmm0, %xmm0
000000000005373f	movsd	%xmm0, -0x20(%rbp)
0000000000053744	movsd	-0x38(%rbp), %xmm0
0000000000053749	movsd	%xmm0, (%rbx)
000000000005374d	movsd	-0x30(%rbp), %xmm0
0000000000053752	movsd	%xmm0, 0x8(%rbx)
0000000000053757	movsd	-0x20(%rbp), %xmm0
000000000005375c	movsd	%xmm0, 0x10(%rbx)
0000000000053761	addq	$0x28, %rsp
0000000000053765	popq	%rbx
0000000000053766	popq	%r14
0000000000053768	popq	%r15
000000000005376a	popq	%rbp
000000000005376b	retq
