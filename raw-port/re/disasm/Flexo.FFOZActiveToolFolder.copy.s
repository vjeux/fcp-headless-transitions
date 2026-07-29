__ZN20FFOZActiveToolFolder4copyEPK13OZChannelBaseb:
00000000002176a0	pushq	%rbp
00000000002176a1	movq	%rsp, %rbp
00000000002176a4	pushq	%r14
00000000002176a6	pushq	%rbx
00000000002176a7	movq	%rsi, %r14
00000000002176aa	movq	%rdi, %rbx
00000000002176ad	callq	0x1496528                       ## symbol stub for: __ZN15OZChannelFolder4copyEPK13OZChannelBaseb
00000000002176b2	testq	%r14, %r14
00000000002176b5	je	0x2176f0
00000000002176b7	movq	0x16d24d2(%rip), %rsi           ## literal pool symbol address: __ZTI13OZChannelBase
00000000002176be	leaq	__ZTI20FFOZActiveToolFolder(%rip), %rdx ## typeinfo for FFOZActiveToolFolder
00000000002176c5	movq	%r14, %rdi
00000000002176c8	xorl	%ecx, %ecx
00000000002176ca	callq	0x14974b8                       ## symbol stub for: ___dynamic_cast
00000000002176cf	testq	%rax, %rax
00000000002176d2	je	0x2176f0
00000000002176d4	addq	$0x88, %rax
00000000002176da	addq	$0x88, %rbx
00000000002176e1	movq	%rbx, %rdi
00000000002176e4	movq	%rax, %rsi
00000000002176e7	popq	%rbx
00000000002176e8	popq	%r14
00000000002176ea	popq	%rbp
00000000002176eb	jmp	0x1496db0                       ## symbol stub for: __ZN8PCString3setERKS_
00000000002176f0	popq	%rbx
00000000002176f1	popq	%r14
00000000002176f3	popq	%rbp
00000000002176f4	retq
00000000002176f5	nopw	%cs:(%rax,%rax)
