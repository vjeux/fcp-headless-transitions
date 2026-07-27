__ZN6SCurve16fitCurveToPointsERKNSt3__16vectorIfNS0_9allocatorIfEEEES6_RdS7_S7_S7_f:
0000000000063330	pushq	%rbp
0000000000063331	movq	%rsp, %rbp
0000000000063334	pushq	%r15
0000000000063336	pushq	%r14
0000000000063338	pushq	%r13
000000000006333a	pushq	%r12
000000000006333c	pushq	%rbx
000000000006333d	subq	$0x298, %rsp                    ## imm = 0x298
0000000000063344	movaps	%xmm0, -0x2c0(%rbp)
000000000006334b	movq	%r9, -0x1d8(%rbp)
0000000000063352	movq	%r8, -0x1d0(%rbp)
0000000000063359	movq	%rsi, %r14
000000000006335c	xorps	%xmm0, %xmm0
000000000006335f	movaps	%xmm0, -0x60(%rbp)
0000000000063363	movq	$0x0, -0x50(%rbp)
000000000006336b	movq	(%rdi), %r13
000000000006336e	movq	%rdi, -0x1e0(%rbp)
0000000000063375	movq	0x8(%rdi), %rdi
0000000000063379	movq	%rdi, %rbx
000000000006337c	subq	%r13, %rbx
000000000006337f	movq	%rdi, %r15
0000000000063382	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
000000000006338c	subq	%r13, %rdi
000000000006338f	movq	%rcx, -0x1c8(%rbp)
0000000000063396	movq	%rdx, -0x1c0(%rbp)
000000000006339d	je	0x636d3
00000000000633a3	sarq	$0x2, %rbx
00000000000633a7	cmpq	%rax, %rbx
00000000000633aa	ja	0x63d81
00000000000633b0	addq	%rdi, %rdi
00000000000633b3	movq	$0x0, -0x40(%rbp)
00000000000633bb	callq	0x1497452                       ## symbol stub for: __Znwm
00000000000633c0	movq	%rax, %r12
00000000000633c3	leaq	(%rax,%rbx,8), %r8
00000000000633c7	movq	%rax, -0x58(%rbp)
00000000000633cb	movq	%r15, %rdi
00000000000633ce	cmpq	%r13, %r15
00000000000633d1	je	0x636e5
00000000000633d7	xorl	%r15d, %r15d
00000000000633da	movq	%r12, %r11
00000000000633dd	movabsq	$0x1fffffffffffffff, %rsi       ## imm = 0x1FFFFFFFFFFFFFFF
00000000000633e7	movq	%r14, -0x98(%rbp)
00000000000633ee	jmp	0x63417
00000000000633f0	movss	%xmm0, (%r12)
00000000000633f6	movss	%xmm1, 0x4(%r12)
00000000000633fd	addq	$0x8, %r12
0000000000063401	incl	%r15d
0000000000063404	movq	%rdi, %rax
0000000000063407	subq	%r13, %rax
000000000006340a	sarq	$0x2, %rax
000000000006340e	cmpq	%r15, %rax
0000000000063411	jbe	0x636cd
0000000000063417	movss	(%r13,%r15,4), %xmm0
000000000006341e	movq	(%r14), %rax
0000000000063421	movss	(%rax,%r15,4), %xmm1
0000000000063427	cmpq	%r8, %r12
000000000006342a	jb	0x633f0
000000000006342c	movq	%r13, -0x1f0(%rbp)
0000000000063433	movq	%r12, %r14
0000000000063436	subq	%r11, %r14
0000000000063439	movq	%r14, %rbx
000000000006343c	sarq	$0x3, %rbx
0000000000063440	leaq	0x1(%rbx), %rax
0000000000063444	cmpq	%rsi, %rax
0000000000063447	movq	%r11, -0x40(%rbp)
000000000006344b	ja	0x63d53
0000000000063451	movss	%xmm1, -0x80(%rbp)
0000000000063456	movss	%xmm0, -0x90(%rbp)
000000000006345e	movq	%rdi, -0x1e8(%rbp)
0000000000063465	movq	%r8, -0x68(%rbp)
0000000000063469	movq	%r8, %rcx
000000000006346c	subq	%r11, %rcx
000000000006346f	movq	%rcx, %r13
0000000000063472	sarq	$0x2, %r13
0000000000063476	cmpq	%rax, %r13
0000000000063479	cmovbeq	%rax, %r13
000000000006347d	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
0000000000063487	cmpq	%rax, %rcx
000000000006348a	cmovaeq	%rsi, %r13
000000000006348e	cmpq	%rsi, %r13
0000000000063491	ja	0x63d66
0000000000063497	leaq	(,%r13,8), %rdi
000000000006349f	callq	0x1497452                       ## symbol stub for: __Znwm
00000000000634a4	leaq	(%rax,%r14), %r11
00000000000634a8	movss	-0x90(%rbp), %xmm0
00000000000634b0	movss	%xmm0, (%rax,%r14)
00000000000634b6	movss	-0x80(%rbp), %xmm0
00000000000634bb	movss	%xmm0, 0x4(%rax,%r14)
00000000000634c2	shlq	$0x3, %rbx
00000000000634c6	subq	%rbx, %r11
00000000000634c9	cmpq	%r12, -0x40(%rbp)
00000000000634cd	je	0x63517
00000000000634cf	leaq	-0x8(%r14), %rcx
00000000000634d3	movq	-0x40(%rbp), %rdx
00000000000634d7	movq	%r11, %rsi
00000000000634da	cmpq	$0xd8, %rcx
00000000000634e1	jae	0x63585
00000000000634e7	xorl	%ecx, %ecx
00000000000634e9	nopl	(%rax)
00000000000634f0	movss	(%rdx,%rcx), %xmm0
00000000000634f5	movss	%xmm0, (%rsi,%rcx)
00000000000634fa	movss	0x4(%rdx,%rcx), %xmm0
0000000000063500	movss	%xmm0, 0x4(%rsi,%rcx)
0000000000063506	leaq	(%rdx,%rcx), %rdi
000000000006350a	addq	$0x8, %rdi
000000000006350e	addq	$0x8, %rcx
0000000000063512	cmpq	%r12, %rdi
0000000000063515	jne	0x634f0
0000000000063517	leaq	(%rax,%r13,8), %r8
000000000006351b	leaq	(%rax,%r14), %r12
000000000006351f	addq	$0x8, %r12
0000000000063523	movq	-0x40(%rbp), %rdi
0000000000063527	testq	%rdi, %rdi
000000000006352a	je	0x63561
000000000006352c	movq	%r11, %rbx
000000000006352f	movq	%r8, %r14
0000000000063532	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063537	movq	%r14, %r8
000000000006353a	movq	-0x1e0(%rbp), %rax
0000000000063541	movq	(%rax), %r13
0000000000063544	movq	0x8(%rax), %rdi
0000000000063548	movq	%rbx, %r11
000000000006354b	movq	-0x98(%rbp), %r14
0000000000063552	movabsq	$0x1fffffffffffffff, %rsi       ## imm = 0x1FFFFFFFFFFFFFFF
000000000006355c	jmp	0x63401
0000000000063561	movq	-0x98(%rbp), %r14
0000000000063568	movq	-0x1f0(%rbp), %r13
000000000006356f	movabsq	$0x1fffffffffffffff, %rsi       ## imm = 0x1FFFFFFFFFFFFFFF
0000000000063579	movq	-0x1e8(%rbp), %rdi
0000000000063580	jmp	0x63401
0000000000063585	leaq	0x4(%rax), %r10
0000000000063589	movq	%rcx, %rsi
000000000006358c	andq	$-0x8, %rsi
0000000000063590	leaq	(%rax,%rsi), %rdi
0000000000063594	addq	$0x4, %rdi
0000000000063598	leaq	0x8(%rax,%rsi), %r8
000000000006359d	movq	-0x40(%rbp), %rdx
00000000000635a1	leaq	0x4(%rdx), %r9
00000000000635a5	movq	%rcx, -0x90(%rbp)
00000000000635ac	leaq	(%rdx,%rsi), %rcx
00000000000635b0	addq	$0x4, %rcx
00000000000635b4	addq	%rdx, %rsi
00000000000635b7	addq	$0x8, %rsi
00000000000635bb	cmpq	%r8, %r11
00000000000635be	setb	-0x80(%rbp)
00000000000635c2	cmpq	%rdi, %r10
00000000000635c5	setb	-0x68(%rbp)
00000000000635c9	cmpq	%rcx, %r11
00000000000635cc	setb	-0x2d(%rbp)
00000000000635d0	cmpq	%rdi, %rdx
00000000000635d3	setb	-0x2c(%rbp)
00000000000635d7	cmpq	%rsi, %r11
00000000000635da	setb	-0x2b(%rbp)
00000000000635de	cmpq	%rdi, %r9
00000000000635e1	setb	-0x2a(%rbp)
00000000000635e5	cmpq	%rcx, %r10
00000000000635e8	movq	-0x90(%rbp), %rcx
00000000000635ef	setb	%dil
00000000000635f3	cmpq	%r8, %rdx
00000000000635f6	setb	-0x29(%rbp)
00000000000635fa	cmpq	%rsi, %r10
00000000000635fd	setb	%r10b
0000000000063601	cmpq	%r8, %r9
0000000000063604	setb	%r8b
0000000000063608	movq	%r11, %rsi
000000000006360b	movzbl	-0x68(%rbp), %r9d
0000000000063610	testb	%r9b, -0x80(%rbp)
0000000000063614	jne	0x634e7
000000000006361a	movq	-0x40(%rbp), %rdx
000000000006361e	movq	%r11, %rsi
0000000000063621	movzbl	-0x2c(%rbp), %r9d
0000000000063626	andb	%r9b, -0x2d(%rbp)
000000000006362a	jne	0x634e7
0000000000063630	movq	-0x40(%rbp), %rdx
0000000000063634	movq	%r11, %rsi
0000000000063637	movzbl	-0x2a(%rbp), %r9d
000000000006363c	andb	%r9b, -0x2b(%rbp)
0000000000063640	jne	0x634e7
0000000000063646	movq	-0x40(%rbp), %rdx
000000000006364a	movq	%r11, %rsi
000000000006364d	andb	-0x29(%rbp), %dil
0000000000063651	jne	0x634e7
0000000000063657	movq	-0x40(%rbp), %rdx
000000000006365b	movq	%r11, %rsi
000000000006365e	andb	%r8b, %r10b
0000000000063661	jne	0x634e7
0000000000063667	shrq	$0x3, %rcx
000000000006366b	incq	%rcx
000000000006366e	movq	%rcx, %rdi
0000000000063671	andq	$-0x4, %rdi
0000000000063675	movq	-0x40(%rbp), %r10
0000000000063679	leaq	(%r10,%rdi,8), %rdx
000000000006367d	leaq	(%r11,%rdi,8), %rsi
0000000000063681	movq	%r14, %r8
0000000000063684	subq	%rbx, %r8
0000000000063687	addq	%rax, %r8
000000000006368a	addq	$0x10, %r8
000000000006368e	xorl	%r9d, %r9d
0000000000063691	nopw	%cs:(%rax,%rax)
00000000000636a0	movups	(%r10,%r9,8), %xmm0
00000000000636a5	movups	0x10(%r10,%r9,8), %xmm1
00000000000636ab	movups	%xmm0, -0x10(%r8,%r9,8)
00000000000636b1	movups	%xmm1, (%r8,%r9,8)
00000000000636b6	addq	$0x4, %r9
00000000000636ba	cmpq	%r9, %rdi
00000000000636bd	jne	0x636a0
00000000000636bf	cmpq	%rdi, %rcx
00000000000636c2	jne	0x634e7
00000000000636c8	jmp	0x63517
00000000000636cd	movq	%r12, -0x58(%rbp)
00000000000636d1	jmp	0x636e8
00000000000636d3	xorl	%r12d, %r12d
00000000000636d6	xorl	%r8d, %r8d
00000000000636d9	movq	%r15, %rdi
00000000000636dc	cmpq	%r13, %r15
00000000000636df	jne	0x633d7
00000000000636e5	movq	%r12, %r11
00000000000636e8	movq	%r8, -0x50(%rbp)
00000000000636ec	movq	%r11, -0x40(%rbp)
00000000000636f0	movq	%r11, -0x60(%rbp)
00000000000636f4	callq	0x1496c18                       ## symbol stub for: __ZN6OMUtil15getNumberOfCPUsEv
00000000000636f9	movq	$0x0, -0xe0(%rbp)
0000000000063704	leaq	-0xe0(%rbp), %rcx
000000000006370b	movq	%rcx, -0xd8(%rbp)
0000000000063712	movabsq	$0x4812000000, %rdx             ## imm = 0x4812000000
000000000006371c	movq	%rdx, -0xd0(%rbp)
0000000000063723	leaq	___Block_byref_object_copy_(%rip), %rsi
000000000006372a	movq	%rsi, -0xc8(%rbp)
0000000000063731	leaq	___Block_byref_object_dispose_(%rip), %rdi
0000000000063738	movq	%rdi, -0xc0(%rbp)
000000000006373f	leaq	0x17f6d42(%rip), %rcx           ## literal pool for: ""
0000000000063746	movq	%rcx, -0xb8(%rbp)
000000000006374d	movslq	%eax, %r15
0000000000063750	xorps	%xmm0, %xmm0
0000000000063753	movups	%xmm0, -0xb0(%rbp)
000000000006375a	movq	$0x0, -0xa0(%rbp)
0000000000063765	testl	%r15d, %r15d
0000000000063768	movl	%eax, %r14d
000000000006376b	je	0x637cd
000000000006376d	testl	%eax, %eax
000000000006376f	js	0x63d90
0000000000063775	leaq	(,%r15,8), %r13
000000000006377d	movq	%r13, %rdi
0000000000063780	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000063785	movq	%rax, %rbx
0000000000063788	movq	%rax, -0xb0(%rbp)
000000000006378f	leaq	(%rax,%r15,8), %rax
0000000000063793	movq	%rax, -0xa0(%rbp)
000000000006379a	movq	%rbx, %rdi
000000000006379d	movq	%r13, %rsi
00000000000637a0	callq	0x1497476                       ## symbol stub for: ___bzero
00000000000637a5	addq	%r13, %rbx
00000000000637a8	movq	%rbx, -0xa8(%rbp)
00000000000637af	movl	%r14d, %eax
00000000000637b2	movabsq	$0x4812000000, %rdx             ## imm = 0x4812000000
00000000000637bc	leaq	___Block_byref_object_copy_(%rip), %rsi
00000000000637c3	leaq	___Block_byref_object_dispose_(%rip), %rdi
00000000000637ca	xorps	%xmm0, %xmm0
00000000000637cd	movq	$0x0, -0x1b8(%rbp)
00000000000637d8	leaq	-0x1b8(%rbp), %rcx
00000000000637df	movq	%rcx, -0x1b0(%rbp)
00000000000637e6	movq	%rdx, -0x1a8(%rbp)
00000000000637ed	movq	%rsi, -0x1a0(%rbp)
00000000000637f4	movq	%rdi, -0x198(%rbp)
00000000000637fb	leaq	0x17f6c86(%rip), %rcx           ## literal pool for: ""
0000000000063802	movq	%rcx, -0x190(%rbp)
0000000000063809	movups	%xmm0, -0x188(%rbp)
0000000000063810	movq	$0x0, -0x178(%rbp)
000000000006381b	testl	%eax, %eax
000000000006381d	je	0x63874
000000000006381f	leaq	(,%r15,8), %r13
0000000000063827	movq	%r13, %rdi
000000000006382a	callq	0x1497452                       ## symbol stub for: __Znwm
000000000006382f	movq	%rax, %rbx
0000000000063832	movq	%rax, -0x188(%rbp)
0000000000063839	leaq	(%rax,%r15,8), %rax
000000000006383d	movq	%rax, -0x178(%rbp)
0000000000063844	movq	%rbx, %rdi
0000000000063847	movq	%r13, %rsi
000000000006384a	callq	0x1497476                       ## symbol stub for: ___bzero
000000000006384f	addq	%r13, %rbx
0000000000063852	movq	%rbx, -0x180(%rbp)
0000000000063859	movl	%r14d, %eax
000000000006385c	movabsq	$0x4812000000, %rdx             ## imm = 0x4812000000
0000000000063866	leaq	___Block_byref_object_copy_(%rip), %rsi
000000000006386d	leaq	___Block_byref_object_dispose_(%rip), %rdi
0000000000063874	movq	$0x0, -0x170(%rbp)
000000000006387f	leaq	-0x170(%rbp), %rcx
0000000000063886	movq	%rcx, -0x168(%rbp)
000000000006388d	movq	%rdx, -0x160(%rbp)
0000000000063894	movq	%rsi, -0x158(%rbp)
000000000006389b	movq	%rdi, -0x150(%rbp)
00000000000638a2	leaq	0x17f6bdf(%rip), %rcx           ## literal pool for: ""
00000000000638a9	movq	%rcx, -0x148(%rbp)
00000000000638b0	xorps	%xmm0, %xmm0
00000000000638b3	movups	%xmm0, -0x140(%rbp)
00000000000638ba	movq	$0x0, -0x130(%rbp)
00000000000638c5	testl	%eax, %eax
00000000000638c7	je	0x63921
00000000000638c9	leaq	(,%r15,8), %r13
00000000000638d1	movq	%r13, %rdi
00000000000638d4	callq	0x1497452                       ## symbol stub for: __Znwm
00000000000638d9	movq	%rax, %rbx
00000000000638dc	movq	%rax, -0x140(%rbp)
00000000000638e3	leaq	(%rax,%r15,8), %rax
00000000000638e7	movq	%rax, -0x130(%rbp)
00000000000638ee	movq	%rbx, %rdi
00000000000638f1	movq	%r13, %rsi
00000000000638f4	callq	0x1497476                       ## symbol stub for: ___bzero
00000000000638f9	addq	%r13, %rbx
00000000000638fc	movq	%rbx, -0x138(%rbp)
0000000000063903	movl	%r14d, %eax
0000000000063906	movabsq	$0x4812000000, %rdx             ## imm = 0x4812000000
0000000000063910	leaq	___Block_byref_object_copy_(%rip), %rsi
0000000000063917	leaq	___Block_byref_object_dispose_(%rip), %rdi
000000000006391e	xorps	%xmm0, %xmm0
0000000000063921	movq	$0x0, -0x128(%rbp)
000000000006392c	leaq	-0x128(%rbp), %rcx
0000000000063933	movq	%rcx, -0x120(%rbp)
000000000006393a	movq	%rdx, -0x118(%rbp)
0000000000063941	movq	%rsi, -0x110(%rbp)
0000000000063948	movq	%rdi, -0x108(%rbp)
000000000006394f	leaq	0x17f6b32(%rip), %rcx           ## literal pool for: ""
0000000000063956	movq	%rcx, -0x100(%rbp)
000000000006395d	movups	%xmm0, -0xf8(%rbp)
0000000000063964	movq	$0x0, -0xe8(%rbp)
000000000006396f	testl	%eax, %eax
0000000000063971	je	0x639ba
0000000000063973	leaq	(,%r15,8), %r13
000000000006397b	movq	%r13, %rdi
000000000006397e	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000063983	movq	%rax, %rbx
0000000000063986	movq	%rax, -0xf8(%rbp)
000000000006398d	leaq	(%rax,%r15,8), %rax
0000000000063991	movq	%rax, -0xe8(%rbp)
0000000000063998	movq	%rbx, %rdi
000000000006399b	movq	%r13, %rsi
000000000006399e	callq	0x1497476                       ## symbol stub for: ___bzero
00000000000639a3	addq	%r13, %rbx
00000000000639a6	movq	%rbx, -0xf0(%rbp)
00000000000639ad	movl	%r14d, %eax
00000000000639b0	movabsq	$0x4812000000, %rdx             ## imm = 0x4812000000
00000000000639ba	movq	$0x0, -0x238(%rbp)
00000000000639c5	leaq	-0x238(%rbp), %r14
00000000000639cc	movq	%r14, -0x230(%rbp)
00000000000639d3	movq	%rdx, -0x228(%rbp)
00000000000639da	leaq	___Block_byref_object_copy_.4(%rip), %rcx
00000000000639e1	movq	%rcx, -0x220(%rbp)
00000000000639e8	leaq	___Block_byref_object_dispose_.5(%rip), %rcx
00000000000639ef	movq	%rcx, -0x218(%rbp)
00000000000639f6	leaq	0x17f6a8b(%rip), %rcx           ## literal pool for: ""
00000000000639fd	movq	%rcx, -0x210(%rbp)
0000000000063a04	xorps	%xmm0, %xmm0
0000000000063a07	movups	%xmm0, -0x208(%rbp)
0000000000063a0e	movq	$0x0, -0x1f8(%rbp)
0000000000063a19	testl	%eax, %eax
0000000000063a1b	je	0x63a5e
0000000000063a1d	leaq	(,%r15,4), %rbx
0000000000063a25	movq	%rbx, %rdi
0000000000063a28	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000063a2d	movq	%rax, %r13
0000000000063a30	movq	%rax, -0x208(%rbp)
0000000000063a37	leaq	(%rax,%r15,4), %rax
0000000000063a3b	movq	%rax, -0x1f8(%rbp)
0000000000063a42	leaq	0x1509767(%rip), %rsi
0000000000063a49	movq	%r13, %rdi
0000000000063a4c	movq	%rbx, %rdx
0000000000063a4f	callq	0x14978cc                       ## symbol stub for: _memset_pattern16
0000000000063a54	addq	%rbx, %r13
0000000000063a57	movq	%r13, -0x200(%rbp)
0000000000063a5e	movaps	-0x2c0(%rbp), %xmm1
0000000000063a65	movsldup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0,2,2]
0000000000063a69	mulss	0x15092cf(%rip), %xmm1
0000000000063a71	subq	-0x40(%rbp), %r12
0000000000063a75	shrq	$0x3, %r12
0000000000063a79	decl	%r12d
0000000000063a7c	movsd	0x15096fc(%rip), %xmm2
0000000000063a84	mulps	%xmm0, %xmm2
0000000000063a87	movaps	%xmm2, -0x40(%rbp)
0000000000063a8b	mulps	0x15096fe(%rip), %xmm0
0000000000063a92	movaps	%xmm0, -0x90(%rbp)
0000000000063a99	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
0000000000063a9d	subps	%xmm0, %xmm2
0000000000063aa0	xorps	%xmm0, %xmm0
0000000000063aa3	cvtsi2ss	%r15d, %xmm0
0000000000063aa8	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
0000000000063aae	insertps	$0x10, 0x1509708(%rip), %xmm2   ## xmm2 = xmm2[0],mem[0],xmm2[2,3]
0000000000063ab8	divps	%xmm0, %xmm2
0000000000063abb	movaps	%xmm2, -0x80(%rbp)
0000000000063abf	xorl	%edi, %edi
0000000000063ac1	xorl	%esi, %esi
0000000000063ac3	callq	0x149764a                       ## symbol stub for: _dispatch_get_global_queue
0000000000063ac8	movq	0x188a069(%rip), %rcx           ## literal pool symbol address: __NSConcreteStackBlock
0000000000063acf	movq	%rcx, -0x2b0(%rbp)
0000000000063ad6	movl	$0xc2000000, %ecx               ## imm = 0xC2000000
0000000000063adb	movq	%rcx, -0x2a8(%rbp)
0000000000063ae2	leaq	____ZN12_GLOBAL__N_117cFitCurveToPointsERKNSt3__16vectorI5Vec2fNS0_9allocatorIS2_EEEERdS8_S8_S8_fi_block_invoke(%rip), %rcx
0000000000063ae9	movq	%rcx, -0x2a0(%rbp)
0000000000063af0	leaq	"___block_descriptor_120_e8_32r40r48r56r64r_e8_v16?0Q8l"(%rip), %rcx
0000000000063af7	movq	%rcx, -0x298(%rbp)
0000000000063afe	movaps	-0x90(%rbp), %xmm1
0000000000063b05	movss	%xmm1, -0x260(%rbp)
0000000000063b0d	movaps	-0x80(%rbp), %xmm0
0000000000063b11	movlps	%xmm0, -0x25c(%rbp)
0000000000063b18	movl	$0xbcf5c28f, -0x254(%rbp)       ## imm = 0xBCF5C28F
0000000000063b22	movaps	-0x40(%rbp), %xmm0
0000000000063b26	movlps	%xmm0, -0x250(%rbp)
0000000000063b2d	movl	$0x3d23d70a, -0x248(%rbp)       ## imm = 0x3D23D70A
0000000000063b37	movlps	%xmm1, -0x244(%rbp)
0000000000063b3e	movl	%r12d, -0x23c(%rbp)
0000000000063b45	leaq	-0x60(%rbp), %rcx
0000000000063b49	movq	%rcx, -0x268(%rbp)
0000000000063b50	leaq	-0xe0(%rbp), %rcx
0000000000063b57	movq	%rcx, -0x290(%rbp)
0000000000063b5e	leaq	-0x1b8(%rbp), %rcx
0000000000063b65	movq	%rcx, -0x288(%rbp)
0000000000063b6c	leaq	-0x170(%rbp), %rcx
0000000000063b73	movq	%rcx, -0x280(%rbp)
0000000000063b7a	leaq	-0x128(%rbp), %rcx
0000000000063b81	movq	%rcx, -0x278(%rbp)
0000000000063b88	movq	%r14, -0x270(%rbp)
0000000000063b8f	leaq	-0x2b0(%rbp), %rdx
0000000000063b96	movq	%r15, %rdi
0000000000063b99	movq	%rax, %rsi
0000000000063b9c	callq	0x1497602                       ## symbol stub for: _dispatch_apply
0000000000063ba1	movq	-0xd8(%rbp), %rcx
0000000000063ba8	movq	0x30(%rcx), %rax
0000000000063bac	movq	0x38(%rcx), %rcx
0000000000063bb0	subq	%rax, %rcx
0000000000063bb3	movq	-0x1d8(%rbp), %r11
0000000000063bba	movq	-0x1d0(%rbp), %rbx
0000000000063bc1	movq	-0x1c8(%rbp), %r14
0000000000063bc8	movq	-0x1c0(%rbp), %r15
0000000000063bcf	je	0x63c62
0000000000063bd5	sarq	$0x3, %rcx
0000000000063bd9	movq	-0x230(%rbp), %rdx
0000000000063be0	movq	0x30(%rdx), %rdx
0000000000063be4	movq	-0x1b0(%rbp), %rsi
0000000000063beb	movq	-0x168(%rbp), %rdi
0000000000063bf2	movss	0x15095ca(%rip), %xmm0
0000000000063bfa	movq	-0x120(%rbp), %r8
0000000000063c01	xorl	%r9d, %r9d
0000000000063c04	jmp	0x63c1b
0000000000063c06	nopw	%cs:(%rax,%rax)
0000000000063c10	incq	%r9
0000000000063c13	movl	%r9d, %r10d
0000000000063c16	cmpq	%r10, %rcx
0000000000063c19	jbe	0x63c62
0000000000063c1b	movss	(%rdx,%r9,4), %xmm1
0000000000063c21	ucomiss	%xmm1, %xmm0
0000000000063c24	jbe	0x63c10
0000000000063c26	movsd	(%rax,%r9,8), %xmm0
0000000000063c2c	movsd	%xmm0, (%r15)
0000000000063c31	movq	0x30(%rsi), %r10
0000000000063c35	movsd	(%r10,%r9,8), %xmm0
0000000000063c3b	movsd	%xmm0, (%r14)
0000000000063c40	movq	0x30(%rdi), %r10
0000000000063c44	movsd	(%r10,%r9,8), %xmm0
0000000000063c4a	movsd	%xmm0, (%rbx)
0000000000063c4e	movq	0x30(%r8), %r10
0000000000063c52	movsd	(%r10,%r9,8), %xmm0
0000000000063c58	movsd	%xmm0, (%r11)
0000000000063c5d	movaps	%xmm1, %xmm0
0000000000063c60	jmp	0x63c10
0000000000063c62	leaq	-0x238(%rbp), %rdi
0000000000063c69	movl	$0x8, %esi
0000000000063c6e	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063c73	movq	-0x208(%rbp), %rdi
0000000000063c7a	testq	%rdi, %rdi
0000000000063c7d	je	0x63c8b
0000000000063c7f	movq	%rdi, -0x200(%rbp)
0000000000063c86	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063c8b	leaq	-0x128(%rbp), %rdi
0000000000063c92	movl	$0x8, %esi
0000000000063c97	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063c9c	movq	-0xf8(%rbp), %rdi
0000000000063ca3	testq	%rdi, %rdi
0000000000063ca6	je	0x63cb4
0000000000063ca8	movq	%rdi, -0xf0(%rbp)
0000000000063caf	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063cb4	leaq	-0x170(%rbp), %rdi
0000000000063cbb	movl	$0x8, %esi
0000000000063cc0	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063cc5	movq	-0x140(%rbp), %rdi
0000000000063ccc	testq	%rdi, %rdi
0000000000063ccf	je	0x63cdd
0000000000063cd1	movq	%rdi, -0x138(%rbp)
0000000000063cd8	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063cdd	leaq	-0x1b8(%rbp), %rdi
0000000000063ce4	movl	$0x8, %esi
0000000000063ce9	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063cee	movq	-0x188(%rbp), %rdi
0000000000063cf5	testq	%rdi, %rdi
0000000000063cf8	je	0x63d06
0000000000063cfa	movq	%rdi, -0x180(%rbp)
0000000000063d01	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063d06	leaq	-0xe0(%rbp), %rdi
0000000000063d0d	movl	$0x8, %esi
0000000000063d12	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063d17	movq	-0xb0(%rbp), %rdi
0000000000063d1e	testq	%rdi, %rdi
0000000000063d21	je	0x63d2f
0000000000063d23	movq	%rdi, -0xa8(%rbp)
0000000000063d2a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063d2f	movq	-0x60(%rbp), %rdi
0000000000063d33	testq	%rdi, %rdi
0000000000063d36	je	0x63d41
0000000000063d38	movq	%rdi, -0x58(%rbp)
0000000000063d3c	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063d41	addq	$0x298, %rsp                    ## imm = 0x298
0000000000063d48	popq	%rbx
0000000000063d49	popq	%r12
0000000000063d4b	popq	%r13
0000000000063d4d	popq	%r14
0000000000063d4f	popq	%r15
0000000000063d51	popq	%rbp
0000000000063d52	retq
0000000000063d53	movq	%r12, -0x58(%rbp)
0000000000063d57	movq	%r8, -0x50(%rbp)
0000000000063d5b	movq	%r11, -0x60(%rbp)
0000000000063d5f	callq	__ZNSt3__16vectorI5Vec2fNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<Vec2f, std::__1::allocator<Vec2f>>::__throw_length_error[abi:nqe210106]()
0000000000063d64	jmp	0x63d95
0000000000063d66	movq	%r12, -0x58(%rbp)
0000000000063d6a	movq	-0x68(%rbp), %rax
0000000000063d6e	movq	%rax, -0x50(%rbp)
0000000000063d72	movq	-0x40(%rbp), %rax
0000000000063d76	movq	%rax, -0x60(%rbp)
0000000000063d7a	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000063d7f	jmp	0x63d95
0000000000063d81	movq	$0x0, -0x40(%rbp)
0000000000063d89	callq	__ZNSt3__16vectorI5Vec2fNS_9allocatorIS1_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<Vec2f, std::__1::allocator<Vec2f>>::__throw_length_error[abi:nqe210106]()
0000000000063d8e	jmp	0x63d95
0000000000063d90	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<double, std::__1::allocator<double>>::__throw_length_error[abi:nqe210106]()
0000000000063d95	ud2
0000000000063d97	movq	%rax, %rbx
0000000000063d9a	leaq	-0x128(%rbp), %rdi
0000000000063da1	movl	$0x8, %esi
0000000000063da6	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063dab	movq	-0xf8(%rbp), %rdi
0000000000063db2	testq	%rdi, %rdi
0000000000063db5	je	0x63dc8
0000000000063db7	movq	%rdi, -0xf0(%rbp)
0000000000063dbe	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063dc3	jmp	0x63dc8
0000000000063dc5	movq	%rax, %rbx
0000000000063dc8	leaq	-0x170(%rbp), %rdi
0000000000063dcf	movl	$0x8, %esi
0000000000063dd4	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063dd9	movq	-0x140(%rbp), %rdi
0000000000063de0	testq	%rdi, %rdi
0000000000063de3	je	0x63df6
0000000000063de5	movq	%rdi, -0x138(%rbp)
0000000000063dec	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063df1	jmp	0x63df6
0000000000063df3	movq	%rax, %rbx
0000000000063df6	leaq	-0x1b8(%rbp), %rdi
0000000000063dfd	movl	$0x8, %esi
0000000000063e02	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063e07	movq	-0x188(%rbp), %rdi
0000000000063e0e	testq	%rdi, %rdi
0000000000063e11	je	0x63e24
0000000000063e13	movq	%rdi, -0x180(%rbp)
0000000000063e1a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063e1f	jmp	0x63e24
0000000000063e21	movq	%rax, %rbx
0000000000063e24	leaq	-0xe0(%rbp), %rdi
0000000000063e2b	movl	$0x8, %esi
0000000000063e30	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000063e35	jmp	0x63e3a
0000000000063e37	movq	%rax, %rbx
0000000000063e3a	movq	-0xb0(%rbp), %rdi
0000000000063e41	testq	%rdi, %rdi
0000000000063e44	jne	0x63e55
0000000000063e46	cmpq	$0x0, -0x40(%rbp)
0000000000063e4b	jne	0x63e92
0000000000063e4d	movq	%rbx, %rdi
0000000000063e50	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000063e55	movq	%rdi, -0xa8(%rbp)
0000000000063e5c	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063e61	cmpq	$0x0, -0x40(%rbp)
0000000000063e66	je	0x63e4d
0000000000063e68	jmp	0x63e92
0000000000063e6a	jmp	0x63e88
0000000000063e6c	movq	%rax, %rbx
0000000000063e6f	movq	-0x68(%rbp), %rax
0000000000063e73	movq	%rax, -0x50(%rbp)
0000000000063e77	movq	-0x40(%rbp), %rax
0000000000063e7b	movq	%rax, -0x60(%rbp)
0000000000063e7f	cmpq	$0x0, -0x40(%rbp)
0000000000063e84	je	0x63e4d
0000000000063e86	jmp	0x63e92
0000000000063e88	movq	%rax, %rbx
0000000000063e8b	cmpq	$0x0, -0x40(%rbp)
0000000000063e90	je	0x63e4d
0000000000063e92	movq	-0x40(%rbp), %rdi
0000000000063e96	movq	%rdi, -0x58(%rbp)
0000000000063e9a	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000063e9f	movq	%rbx, %rdi
0000000000063ea2	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000063ea7	nopw	(%rax,%rax)
