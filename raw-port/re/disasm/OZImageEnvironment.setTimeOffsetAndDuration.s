__ZN18OZImageEnvironment24setTimeOffsetAndDurationE6CMTimeS0_:
00000000004d5de0	pushq	%rbp
00000000004d5de1	movq	%rsp, %rbp
00000000004d5de4	pushq	%rbx
00000000004d5de5	subq	$0x188, %rsp                    ## imm = 0x188
00000000004d5dec	movq	%rdi, %rbx
00000000004d5def	movq	0x38(%rbp), %rax
00000000004d5df3	movq	%rax, -0x10(%rbp)
00000000004d5df7	movups	0x28(%rbp), %xmm0
00000000004d5dfb	movaps	%xmm0, -0x20(%rbp)
00000000004d5dff	movq	0x34e70a(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000004d5e06	movq	0x10(%rax), %rcx
00000000004d5e0a	movq	%rcx, -0x150(%rbp)
00000000004d5e11	movups	(%rax), %xmm0
00000000004d5e14	movaps	%xmm0, -0x160(%rbp)
00000000004d5e1b	movq	-0x150(%rbp), %rax
00000000004d5e22	movq	%rax, 0x28(%rsp)
00000000004d5e27	movaps	-0x160(%rbp), %xmm0
00000000004d5e2e	movups	%xmm0, 0x18(%rsp)
00000000004d5e33	movq	0x38(%rbp), %rax
00000000004d5e37	movq	%rax, 0x10(%rsp)
00000000004d5e3c	movups	0x28(%rbp), %xmm0
00000000004d5e40	movups	%xmm0, (%rsp)
00000000004d5e44	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000004d5e49	testl	%eax, %eax
00000000004d5e4b	jle	0x4d5e9b
00000000004d5e4d	leaq	0x10(%rbp), %rax
00000000004d5e51	addq	$0x30, %rbx
00000000004d5e55	movq	0x10(%rax), %rcx
00000000004d5e59	movq	%rcx, -0x150(%rbp)
00000000004d5e60	movups	(%rax), %xmm0
00000000004d5e63	movaps	%xmm0, -0x160(%rbp)
00000000004d5e6a	movaps	-0x20(%rbp), %xmm0
00000000004d5e6e	movups	%xmm0, -0x148(%rbp)
00000000004d5e75	movq	-0x10(%rbp), %rax
00000000004d5e79	movq	%rax, -0x138(%rbp)
00000000004d5e80	leaq	-0x160(%rbp), %rsi
00000000004d5e87	movq	%rbx, %rdi
00000000004d5e8a	xorl	%edx, %edx
00000000004d5e8c	callq	0x6de7c0                        ## symbol stub for: __ZN23OZChannelObjectRootBase13setTimeExtentERK11PCTimeRangeb
00000000004d5e91	addq	$0x188, %rsp                    ## imm = 0x188
00000000004d5e98	popq	%rbx
00000000004d5e99	popq	%rbp
00000000004d5e9a	retq
00000000004d5e9b	movq	(%rbx), %rax
00000000004d5e9e	movq	%rbx, %rdi
00000000004d5ea1	callq	*0x110(%rax)
00000000004d5ea7	testq	%rax, %rax
00000000004d5eaa	je	0x4d5e4d
00000000004d5eac	movq	(%rbx), %rax
00000000004d5eaf	movq	%rbx, %rdi
00000000004d5eb2	callq	*0x110(%rax)
00000000004d5eb8	leaq	0x90(%rax), %rsi
00000000004d5ebf	leaq	-0x160(%rbp), %rdi
00000000004d5ec6	callq	__ZN15OZSceneSettingsC1ERKS_    ## OZSceneSettings::OZSceneSettings(OZSceneSettings const&)
00000000004d5ecb	movq	(%rbx), %rax
00000000004d5ece	movq	%rbx, %rdi
00000000004d5ed1	callq	*0x110(%rax)
00000000004d5ed7	addq	$0x90, %rax
00000000004d5edd	leaq	-0x50(%rbp), %rdi
00000000004d5ee1	movq	%rax, %rsi
00000000004d5ee4	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
00000000004d5ee9	movl	-0x150(%rbp), %edx
00000000004d5eef	leaq	-0x38(%rbp), %rdi
00000000004d5ef3	leaq	-0x50(%rbp), %rsi
00000000004d5ef7	callq	0x6dfc7e                        ## symbol stub for: __ZmlRK6CMTimej
00000000004d5efc	movq	-0x28(%rbp), %rax
00000000004d5f00	movq	%rax, -0x10(%rbp)
00000000004d5f04	movups	-0x38(%rbp), %xmm0
00000000004d5f08	movaps	%xmm0, -0x20(%rbp)
00000000004d5f0c	leaq	__ZTV15OZSceneSettings(%rip), %rax ## vtable for OZSceneSettings
00000000004d5f13	addq	$0x10, %rax
00000000004d5f17	movq	%rax, -0x160(%rbp)
00000000004d5f1e	leaq	-0xa8(%rbp), %rdi
00000000004d5f25	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004d5f2a	movq	-0xe0(%rbp), %rdi
00000000004d5f31	testq	%rdi, %rdi
00000000004d5f34	je	0x4d5e4d
00000000004d5f3a	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004d5f3f	jmp	0x4d5e4d
00000000004d5f44	movq	%rax, %rdi
00000000004d5f47	callq	___clang_call_terminate
00000000004d5f4c	movq	%rax, %rbx
00000000004d5f4f	leaq	-0x160(%rbp), %rdi
00000000004d5f56	callq	__ZN15OZSceneSettingsD1Ev       ## OZSceneSettings::~OZSceneSettings()
00000000004d5f5b	movq	%rbx, %rdi
00000000004d5f5e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004d5f63	nopw	%cs:(%rax,%rax)
