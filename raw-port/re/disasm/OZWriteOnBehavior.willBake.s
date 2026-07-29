__ZN17OZWriteOnBehavior8willBakeER11PCTimeRange:
0000000000477490	pushq	%rbp
0000000000477491	movq	%rsp, %rbp
0000000000477494	pushq	%r15
0000000000477496	pushq	%r14
0000000000477498	pushq	%r13
000000000047749a	pushq	%r12
000000000047749c	pushq	%rbx
000000000047749d	subq	$0x98, %rsp
00000000004774a4	movq	%rsi, %r12
00000000004774a7	movq	%rdi, %rbx
00000000004774aa	movq	(%rdi), %rax
00000000004774ad	callq	*0x140(%rax)
00000000004774b3	testq	%rax, %rax
00000000004774b6	je	0x4777ac
00000000004774bc	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000004774c3	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
00000000004774ca	movl	$0xc8, %ecx
00000000004774cf	movq	%rax, %rdi
00000000004774d2	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004774d7	testq	%rax, %rax
00000000004774da	je	0x4777ac
00000000004774e0	movq	%rax, %r15
00000000004774e3	movq	0x28(%r12), %rax
00000000004774e8	movq	%rax, -0x70(%rbp)
00000000004774ec	movups	0x18(%r12), %xmm0
00000000004774f2	movaps	%xmm0, -0x80(%rbp)
00000000004774f6	movq	(%rbx), %rax
00000000004774f9	movq	%rbx, %rdi
00000000004774fc	callq	*0x150(%rax)
0000000000477502	leaq	0x90(%rax), %rsi
0000000000477509	leaq	-0xa8(%rbp), %r14
0000000000477510	movq	%r14, %rdi
0000000000477513	callq	__ZNK15OZSceneSettings16getFrameDurationEv ## OZSceneSettings::getFrameDuration() const
0000000000477518	leaq	-0x60(%rbp), %rdi
000000000047751c	leaq	-0x80(%rbp), %rsi
0000000000477520	movq	%r14, %rdx
0000000000477523	callq	0x6dfc42                        ## symbol stub for: __ZdvRK6CMTimeS1_
0000000000477528	movq	-0x50(%rbp), %rax
000000000047752c	movq	%rax, 0x10(%rsp)
0000000000477531	movupd	-0x60(%rbp), %xmm0
0000000000477536	movupd	%xmm0, (%rsp)
000000000047753b	callq	0x6dcac2                        ## symbol stub for: _CMTimeGetSeconds
0000000000477540	cvttsd2si	%xmm0, %rax
0000000000477545	movl	%eax, -0x34(%rbp)
0000000000477548	movq	0x810(%rbx), %rax
000000000047754f	movq	0x828(%rbx), %rcx
0000000000477556	movq	%rax, 0x818(%rbx)
000000000047755d	movq	%rcx, 0x830(%rbx)
0000000000477564	movq	0x10(%r12), %rax
0000000000477569	movq	%r12, -0x88(%rbp)
0000000000477570	movups	(%r12), %xmm0
0000000000477575	movups	%xmm0, 0x840(%rbx)
000000000047757c	movq	%rax, 0x850(%rbx)
0000000000477583	leaq	0x7110(%r15), %rsi
000000000047758a	leaq	-0x60(%rbp), %rdi
000000000047758e	movq	%rsi, -0x90(%rbp)
0000000000477595	callq	0x6df41a                        ## symbol stub for: __ZN9OZChannel29enumerateCurveProcessingNodesEv
000000000047759a	movq	-0x60(%rbp), %r13
000000000047759e	movq	-0x58(%rbp), %r12
00000000004775a2	cmpq	%r12, %r13
00000000004775a5	je	0x477607
00000000004775a7	movq	%r15, -0x30(%rbp)
00000000004775ab	movq	$0x0, -0x40(%rbp)
00000000004775b3	leaq	__ZTI18OZWriteOnCurveNode(%rip), %r15 ## typeinfo for OZWriteOnCurveNode
00000000004775ba	xorl	%r14d, %r14d
00000000004775bd	jmp	0x4775d1
00000000004775bf	nop
00000000004775c0	leaq	(%r14,%r13), %rax
00000000004775c4	addq	$0x8, %rax
00000000004775c8	addq	$0x8, %r14
00000000004775cc	cmpq	%r12, %rax
00000000004775cf	je	0x477619
00000000004775d1	movq	(%r13,%r14), %rdi
00000000004775d6	testq	%rdi, %rdi
00000000004775d9	je	0x4775c0
00000000004775db	movq	0x3ab146(%rip), %rsi            ## literal pool symbol address: __ZTI11OZCurveNode
00000000004775e2	movq	%r15, %rdx
00000000004775e5	xorl	%ecx, %ecx
00000000004775e7	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004775ec	testq	%rax, %rax
00000000004775ef	je	0x4775c0
00000000004775f1	cmpq	%rbx, 0x8(%rax)
00000000004775f5	jne	0x4775c0
00000000004775f7	testq	%r14, %r14
00000000004775fa	je	0x477611
00000000004775fc	movq	-0x8(%r13,%r14), %rax
0000000000477601	movq	%rax, -0x40(%rbp)
0000000000477605	jmp	0x477619
0000000000477607	movq	$0x0, -0x40(%rbp)
000000000047760f	jmp	0x47761d
0000000000477611	movq	$0x0, -0x40(%rbp)
0000000000477619	movq	-0x30(%rbp), %r15
000000000047761d	leaq	0x810(%rbx), %r12
0000000000477624	addq	$0x71a8, %r15                   ## imm = 0x71A8
000000000047762b	movq	%r15, -0x30(%rbp)
000000000047762f	testq	%r13, %r13
0000000000477632	je	0x47763c
0000000000477634	movq	%r13, %rdi
0000000000477637	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000047763c	movq	-0x88(%rbp), %rcx
0000000000477643	movq	0x10(%rcx), %rax
0000000000477647	movq	%rax, -0x70(%rbp)
000000000047764b	movups	(%rcx), %xmm0
000000000047764e	movaps	%xmm0, -0x80(%rbp)
0000000000477652	movq	-0x90(%rbp), %r13
0000000000477659	movq	(%r13), %rax
000000000047765d	leaq	-0x60(%rbp), %r14
0000000000477661	leaq	-0x80(%rbp), %rdx
0000000000477665	movq	%r14, %rdi
0000000000477668	movq	%r13, %rsi
000000000047766b	callq	*0x148(%rax)
0000000000477671	leaq	-0xa8(%rbp), %r15
0000000000477678	movl	$0x1, %esi
000000000047767d	movq	%r15, %rdi
0000000000477680	movl	$0x1, %edx
0000000000477685	callq	0x6dcac8                        ## symbol stub for: _CMTimeMake
000000000047768a	movq	%r12, (%rsp)
000000000047768e	movq	$0x0, -0x48(%rbp)
0000000000477696	leaq	-0x34(%rbp), %r8
000000000047769a	movq	%r13, %rdi
000000000047769d	movq	-0x40(%rbp), %rsi
00000000004776a1	movq	%r14, %rdx
00000000004776a4	movq	%r15, %rcx
00000000004776a7	xorl	%r9d, %r9d
00000000004776aa	callq	0x6df252                        ## symbol stub for: __ZN9OZChannel10getSamplesEPvRK6CMTimeS3_RjPNSt3__16vectorIS1_NS5_9allocatorIS1_EEEEPNS6_IdNS7_IdEEEE
00000000004776af	leaq	-0x60(%rbp), %rdi
00000000004776b3	movq	-0x30(%rbp), %r15
00000000004776b7	movq	%r15, %rsi
00000000004776ba	callq	0x6df41a                        ## symbol stub for: __ZN9OZChannel29enumerateCurveProcessingNodesEv
00000000004776bf	movq	-0x60(%rbp), %r12
00000000004776c3	movq	-0x58(%rbp), %r13
00000000004776c7	cmpq	%r13, %r12
00000000004776ca	je	0x477732
00000000004776cc	movq	$0x0, -0x48(%rbp)
00000000004776d4	leaq	__ZTI18OZWriteOnCurveNode(%rip), %r15 ## typeinfo for OZWriteOnCurveNode
00000000004776db	xorl	%r14d, %r14d
00000000004776de	jmp	0x4776f1
00000000004776e0	leaq	(%r12,%r14), %rax
00000000004776e4	addq	$0x8, %rax
00000000004776e8	addq	$0x8, %r14
00000000004776ec	cmpq	%r13, %rax
00000000004776ef	je	0x47772e
00000000004776f1	movq	(%r12,%r14), %rdi
00000000004776f5	testq	%rdi, %rdi
00000000004776f8	je	0x4776e0
00000000004776fa	movq	0x3ab027(%rip), %rsi            ## literal pool symbol address: __ZTI11OZCurveNode
0000000000477701	movq	%r15, %rdx
0000000000477704	xorl	%ecx, %ecx
0000000000477706	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000047770b	testq	%rax, %rax
000000000047770e	je	0x4776e0
0000000000477710	cmpq	%rbx, 0x8(%rax)
0000000000477714	jne	0x4776e0
0000000000477716	testq	%r14, %r14
0000000000477719	je	0x477726
000000000047771b	movq	-0x8(%r12,%r14), %rax
0000000000477720	movq	%rax, -0x48(%rbp)
0000000000477724	jmp	0x47772e
0000000000477726	movq	$0x0, -0x48(%rbp)
000000000047772e	movq	-0x30(%rbp), %r15
0000000000477732	leaq	0x828(%rbx), %r13
0000000000477739	testq	%r12, %r12
000000000047773c	je	0x477746
000000000047773e	movq	%r12, %rdi
0000000000477741	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000477746	movq	-0x88(%rbp), %rcx
000000000047774d	movq	0x10(%rcx), %rax
0000000000477751	movq	%rax, -0x70(%rbp)
0000000000477755	movups	(%rcx), %xmm0
0000000000477758	movaps	%xmm0, -0x80(%rbp)
000000000047775c	movq	(%r15), %rax
000000000047775f	leaq	-0x60(%rbp), %r14
0000000000477763	leaq	-0x80(%rbp), %rdx
0000000000477767	movq	%r14, %rdi
000000000047776a	movq	%r15, %rsi
000000000047776d	callq	*0x148(%rax)
0000000000477773	movq	%r15, %r12
0000000000477776	leaq	-0xa8(%rbp), %r15
000000000047777d	movl	$0x1, %esi
0000000000477782	movq	%r15, %rdi
0000000000477785	movl	$0x1, %edx
000000000047778a	callq	0x6dcac8                        ## symbol stub for: _CMTimeMake
000000000047778f	movq	%r13, (%rsp)
0000000000477793	leaq	-0x34(%rbp), %r8
0000000000477797	movq	%r12, %rdi
000000000047779a	movq	-0x48(%rbp), %rsi
000000000047779e	movq	%r14, %rdx
00000000004777a1	movq	%r15, %rcx
00000000004777a4	xorl	%r9d, %r9d
00000000004777a7	callq	0x6df252                        ## symbol stub for: __ZN9OZChannel10getSamplesEPvRK6CMTimeS3_RjPNSt3__16vectorIS1_NS5_9allocatorIS1_EEEEPNS6_IdNS7_IdEEEE
00000000004777ac	movb	$0x1, 0x138(%rbx)
00000000004777b3	addq	$0x98, %rsp
00000000004777ba	popq	%rbx
00000000004777bb	popq	%r12
00000000004777bd	popq	%r13
00000000004777bf	popq	%r14
00000000004777c1	popq	%r15
00000000004777c3	popq	%rbp
00000000004777c4	retq
00000000004777c5	nopw	%cs:(%rax,%rax)
