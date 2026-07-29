__ZN17OZWriteOnBehavior5resetEv:
0000000000477260	pushq	%rbp
0000000000477261	movq	%rsp, %rbp
0000000000477264	pushq	%r14
0000000000477266	pushq	%rbx
0000000000477267	subq	$0xb0, %rsp
000000000047726e	movq	%rdi, %r14
0000000000477271	movq	(%rdi), %rax
0000000000477274	leaq	-0x78(%rbp), %rdi
0000000000477278	movq	%r14, %rsi
000000000047727b	callq	*0x268(%rax)
0000000000477281	leaq	0x640(%r14), %rbx
0000000000477288	movq	%rbx, %rdi
000000000047728b	xorl	%esi, %esi
000000000047728d	callq	0x6dd8f6                        ## symbol stub for: __ZN13OZChannelBase5resetEb
0000000000477292	movq	%rbx, %rdi
0000000000477295	movl	$0x4, %esi
000000000047729a	callq	0x6df33c                        ## symbol stub for: __ZN9OZChannel16setInterpolationEj
000000000047729f	movq	0x3ad26a(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000004772a6	xorps	%xmm0, %xmm0
00000000004772a9	movq	%rbx, %rdi
00000000004772ac	movl	$0x1, %edx
00000000004772b1	callq	0x6df294                        ## symbol stub for: __ZN9OZChannel11setKeyframeERK6CMTimedb
00000000004772b6	movq	-0x50(%rbp), %rax
00000000004772ba	movq	%rax, -0x20(%rbp)
00000000004772be	movups	-0x60(%rbp), %xmm0
00000000004772c2	movaps	%xmm0, -0x30(%rbp)
00000000004772c6	leaq	-0x48(%rbp), %rdi
00000000004772ca	movq	%r14, %rsi
00000000004772cd	callq	__ZNK10OZBehavior16getFrameDurationEv ## OZBehavior::getFrameDuration() const
00000000004772d2	movq	-0x38(%rbp), %rax
00000000004772d6	movq	%rax, 0x28(%rsp)
00000000004772db	movups	-0x48(%rbp), %xmm0
00000000004772df	movups	%xmm0, 0x18(%rsp)
00000000004772e4	movq	-0x20(%rbp), %rax
00000000004772e8	movq	%rax, 0x10(%rsp)
00000000004772ed	movaps	-0x30(%rbp), %xmm0
00000000004772f1	movups	%xmm0, (%rsp)
00000000004772f5	leaq	-0x90(%rbp), %r14
00000000004772fc	movq	%r14, %rdi
00000000004772ff	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000477304	movsd	0x28e11c(%rip), %xmm0
000000000047730c	movq	%rbx, %rdi
000000000047730f	movq	%r14, %rsi
0000000000477312	movl	$0x1, %edx
0000000000477317	callq	0x6df294                        ## symbol stub for: __ZN9OZChannel11setKeyframeERK6CMTimedb
000000000047731c	addq	$0xb0, %rsp
0000000000477323	popq	%rbx
0000000000477324	popq	%r14
0000000000477326	popq	%rbp
0000000000477327	retq
0000000000477328	nopl	(%rax,%rax)
