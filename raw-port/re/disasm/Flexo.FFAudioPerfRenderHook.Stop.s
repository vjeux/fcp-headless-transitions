__ZN21FFAudioPerfRenderHook4StopEv:
0000000000d02bc0	movq	0x28(%rdi), %rax
0000000000d02bc4	movq	0x30(%rdi), %rcx
0000000000d02bc8	cmpq	%rcx, %rax
0000000000d02bcb	jle	0xd02d62
0000000000d02bd1	pushq	%rbp
0000000000d02bd2	movq	%rsp, %rbp
0000000000d02bd5	pushq	%r14
0000000000d02bd7	pushq	%rbx
0000000000d02bd8	subq	$0x80, %rsp
0000000000d02bdf	movq	%rdi, %rbx
0000000000d02be2	xorpd	%xmm0, %xmm0
0000000000d02be6	movapd	%xmm0, -0x20(%rbp)
0000000000d02beb	movapd	%xmm0, -0x30(%rbp)
0000000000d02bf0	movapd	%xmm0, -0x40(%rbp)
0000000000d02bf5	leaq	-0x40(%rbp), %rdi
0000000000d02bf9	callq	__ZN19FFRunningStatistics5resetEv ## FFRunningStatistics::reset()
0000000000d02bfe	movq	0x28(%rbx), %rax
0000000000d02c02	subq	0x20(%rbx), %rax
0000000000d02c06	xorl	%ecx, %ecx
0000000000d02c08	testq	%rax, %rax
0000000000d02c0b	cmovgq	%rax, %rcx
0000000000d02c0f	xchgq	%rcx, 0x30(%rbx)
0000000000d02c13	movq	0x28(%rbx), %rax
0000000000d02c17	movq	0x30(%rbx), %rcx
0000000000d02c1b	cmpq	%rcx, %rax
0000000000d02c1e	jle	0xd02c80
0000000000d02c20	leaq	-0x40(%rbp), %r14
0000000000d02c24	jmp	0xd02c5f
0000000000d02c26	nopw	%cs:(%rax,%rax)
0000000000d02c30	xorl	%edx, %edx
0000000000d02c32	divq	%rcx
0000000000d02c35	movq	0x10(%rbx), %rax
0000000000d02c39	movq	(%rax,%rdx,8), %rdi
0000000000d02c3d	callq	_FFConvertHostTimeToSeconds
0000000000d02c42	mulsd	0x86c63e(%rip), %xmm0
0000000000d02c4a	movq	%r14, %rdi
0000000000d02c4d	callq	__ZN19FFRunningStatistics7addDataEd ## FFRunningStatistics::addData(double)
0000000000d02c52	movq	0x28(%rbx), %rax
0000000000d02c56	movq	0x30(%rbx), %rcx
0000000000d02c5a	cmpq	%rcx, %rax
0000000000d02c5d	jle	0xd02c80
0000000000d02c5f	movl	$0x1, %eax
0000000000d02c64	lock
0000000000d02c65	xaddq	%rax, 0x30(%rbx)
0000000000d02c6a	movq	0x20(%rbx), %rcx
0000000000d02c6e	movq	%rax, %rdx
0000000000d02c71	orq	%rcx, %rdx
0000000000d02c74	shrq	$0x20, %rdx
0000000000d02c78	jne	0xd02c30
0000000000d02c7a	xorl	%edx, %edx
0000000000d02c7c	divl	%ecx
0000000000d02c7e	jmp	0xd02c35
0000000000d02c80	cmpq	$0x0, -0x40(%rbp)
0000000000d02c85	je	0xd02d57
0000000000d02c8b	callq	0x149791a                       ## symbol stub for: _objc_autoreleasePoolPush
0000000000d02c90	movq	%rax, %rbx
0000000000d02c93	leaq	_gFFPMR_ENABLED(%rip), %rax
0000000000d02c9a	movzbl	(%rax), %eax
0000000000d02c9d	testb	$0x1, %al
0000000000d02c9f	je	0xd02d4f
0000000000d02ca5	leaq	_gFFPMR_ENABLED_all(%rip), %rax
0000000000d02cac	movzbl	(%rax), %eax
0000000000d02caf	testb	$0x1, %al
0000000000d02cb1	jne	0xd02cc5
0000000000d02cb3	leaq	_gFFPMR_ENABLED_audio(%rip), %rax
0000000000d02cba	movzbl	(%rax), %eax
0000000000d02cbd	testb	$0x1, %al
0000000000d02cbf	je	0xd02d4f
0000000000d02cc5	leaq	_OBJC_CLASS_$_FFPMRLoggingFunnels(%rip), %rdi
0000000000d02ccc	movq	0xeb58a5(%rip), %rsi
0000000000d02cd3	movq	0xbea9e6(%rip), %r14            ## Objc message: -[%rdi _notifyOfFirstDrawing:]
0000000000d02cda	callq	*%r14
0000000000d02cdd	movq	0xeb66bc(%rip), %rsi
0000000000d02ce4	leaq	0xc3053d(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d02ceb	movq	%rax, %rdi
0000000000d02cee	callq	*%r14
0000000000d02cf1	movq	0xbeae40(%rip), %rcx            ## literal pool symbol address: __NSConcreteStackBlock
0000000000d02cf8	movq	%rcx, -0x90(%rbp)
0000000000d02cff	movl	$0xc6000000, %ecx               ## imm = 0xC6000000
0000000000d02d04	movq	%rcx, -0x88(%rbp)
0000000000d02d0b	leaq	____ZN21FFAudioPerfRenderHook4StopEv_block_invoke(%rip), %rcx
0000000000d02d12	movq	%rcx, -0x80(%rbp)
0000000000d02d16	leaq	"___block_descriptor_80_e8_32c25_ZTS19FFRunningStatistics_e9_v16?0^v8l"(%rip), %rcx
0000000000d02d1d	movq	%rcx, -0x78(%rbp)
0000000000d02d21	movapd	-0x40(%rbp), %xmm0
0000000000d02d26	movaps	-0x30(%rbp), %xmm1
0000000000d02d2a	movaps	-0x20(%rbp), %xmm2
0000000000d02d2e	movupd	%xmm0, -0x70(%rbp)
0000000000d02d33	movups	%xmm1, -0x60(%rbp)
0000000000d02d37	movups	%xmm2, -0x50(%rbp)
0000000000d02d3b	movq	0xeb662e(%rip), %rsi
0000000000d02d42	leaq	-0x90(%rbp), %rdx
0000000000d02d49	movq	%rax, %rdi
0000000000d02d4c	callq	*%r14
0000000000d02d4f	movq	%rbx, %rdi
0000000000d02d52	callq	0x1497914                       ## symbol stub for: _objc_autoreleasePoolPop
0000000000d02d57	addq	$0x80, %rsp
0000000000d02d5e	popq	%rbx
0000000000d02d5f	popq	%r14
0000000000d02d61	popq	%rbp
0000000000d02d62	retq
0000000000d02d63	nopw	%cs:(%rax,%rax)
