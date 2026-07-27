__ZN7OZCurve12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000000270c0	pushq	%rbp
00000000000270c1	movq	%rsp, %rbp
00000000000270c4	pushq	%r15
00000000000270c6	pushq	%r14
00000000000270c8	pushq	%r12
00000000000270ca	pushq	%rbx
00000000000270cb	subq	$0x50, %rsp
00000000000270cf	movq	%rdx, %r15
00000000000270d2	movq	%rsi, %r14
00000000000270d5	movq	%rdi, %rbx
00000000000270d8	xorl	%eax, %eax
00000000000270da	movl	%eax, -0x28(%rbp)
00000000000270dd	movl	%eax, -0x34(%rbp)
00000000000270e0	movq	%rax, -0x30(%rbp)
00000000000270e4	movb	$0x0, -0x21(%rbp)
00000000000270e8	movq	%rax, -0x40(%rbp)
00000000000270ec	movl	0x8(%rdx), %ecx
00000000000270ef	leal	-0x33(%rcx), %eax
00000000000270f2	cmpl	$0xe, %eax
00000000000270f5	ja	0x2712a
00000000000270f7	leaq	0x672(%rip), %rcx
00000000000270fe	movslq	(%rcx,%rax,4), %rax
0000000000027102	addq	%rcx, %rax
0000000000027105	jmpq	*%rax
0000000000027107	leaq	-0x28(%rbp), %r12
000000000002710b	movq	%r14, %rdi
000000000002710e	movq	%r15, %rsi
0000000000027111	movq	%r12, %rdx
0000000000027114	callq	0xacc30                         ## symbol stub for: __ZN22PCSerializerReadStream10getAsInt32ER15PCStreamElementPi
0000000000027119	movl	(%r12), %esi
000000000002711d	movq	(%rbx), %rax
0000000000027120	movq	%rbx, %rdi
0000000000027123	xorl	%edx, %edx
0000000000027125	jmp	0x274ed
000000000002712a	cmpl	$0x76, %ecx
000000000002712d	jne	0x27761
0000000000027133	leaq	-0x34(%rbp), %r12
0000000000027137	movq	%r14, %rdi
000000000002713a	movq	%r15, %rsi
000000000002713d	movl	$0x4, %edx
0000000000027142	movq	%r12, %rcx
0000000000027145	callq	0xacd50                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000002714a	movl	(%r12), %esi
000000000002714e	movq	(%rbx), %rax
0000000000027151	movq	0xa0(%rax), %rax
0000000000027158	movq	%rbx, %rdi
000000000002715b	testl	%esi, %esi
000000000002715d	je	0x276a4
0000000000027163	callq	*%rax
0000000000027165	leaq	-0x30(%rbp), %rcx
0000000000027169	movq	%r14, %rdi
000000000002716c	movq	%r15, %rsi
000000000002716f	movl	$0x1, %edx
0000000000027174	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
0000000000027179	testb	%al, %al
000000000002717b	je	0x2718e
000000000002717d	movsd	-0x30(%rbp), %xmm0
0000000000027182	movq	(%rbx), %rax
0000000000027185	movq	%rbx, %rdi
0000000000027188	callq	*0xd8(%rax)
000000000002718e	leaq	-0x30(%rbp), %rcx
0000000000027192	movq	%r14, %rdi
0000000000027195	movq	%r15, %rsi
0000000000027198	movl	$0x8, %edx
000000000002719d	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
00000000000271a2	testb	%al, %al
00000000000271a4	je	0x276ec
00000000000271aa	movsd	-0x30(%rbp), %xmm0
00000000000271af	movq	(%rbx), %rax
00000000000271b2	movq	%rbx, %rdi
00000000000271b5	callq	*0xc8(%rax)
00000000000271bb	jmp	0x276ec
00000000000271c0	subq	$-0x80, %rbx
00000000000271c4	jmp	0x2753c
00000000000271c9	leaq	-0x28(%rbp), %rdx
00000000000271cd	movq	%r14, %rdi
00000000000271d0	movq	%r15, %rsi
00000000000271d3	callq	0xacc30                         ## symbol stub for: __ZN22PCSerializerReadStream10getAsInt32ER15PCStreamElementPi
00000000000271d8	movq	(%rbx), %rax
00000000000271db	movq	0xa32de(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000271e2	movq	%rbx, %rdi
00000000000271e5	movl	$0x1, %edx
00000000000271ea	callq	*0x2b0(%rax)
00000000000271f0	leaq	0x28(%rbx), %r14
00000000000271f4	movq	%r14, %rdi
00000000000271f7	callq	__ZNK12OZSplineNode9getSplineEv ## OZSplineNode::getSpline() const
00000000000271fc	testq	%rax, %rax
00000000000271ff	jne	0x27225
0000000000027201	movq	0xa0(%rbx), %rax
0000000000027208	cmpb	$0x1, 0x2c(%rax)
000000000002720c	jne	0x2721d
000000000002720e	movq	%rbx, %rdi
0000000000027211	callq	__ZN7OZCurve22createLocalSplineStateEv ## OZCurve::createLocalSplineState()
0000000000027216	movq	%rax, 0xa0(%rbx)
000000000002721d	movq	%r14, %rdi
0000000000027220	callq	__ZN12OZSplineNode12createSplineEv ## OZSplineNode::createSpline()
0000000000027225	movq	%r14, %rdi
0000000000027228	callq	__ZNK12OZSplineNode9getSplineEv ## OZSplineNode::getSpline() const
000000000002722d	movl	-0x28(%rbp), %esi
0000000000027230	movq	%rax, %rdi
0000000000027233	callq	__ZN8OZSpline25reserveMemoryForKeypointsEi ## OZSpline::reserveMemoryForKeypoints(int)
0000000000027238	movb	$0x1, 0x60(%rbx)
000000000002723c	movq	0x40(%rbx), %rdi
0000000000027240	testq	%rdi, %rdi
0000000000027243	je	0x27761
0000000000027249	movl	$0x1, %esi
000000000002724e	callq	__ZN8OZSpline8setDirtyEb        ## OZSpline::setDirty(bool)
0000000000027253	jmp	0x27761
0000000000027258	movq	0x90(%rbx), %rdx
000000000002725f	addq	$0x50, %rdx
0000000000027263	movq	%r14, %rdi
0000000000027266	movq	%r15, %rsi
0000000000027269	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
000000000002726e	leaq	0x28(%rbx), %r14
0000000000027272	movq	%r14, %rdi
0000000000027275	callq	__ZNK12OZSplineNode9getSplineEv ## OZSplineNode::getSpline() const
000000000002727a	testq	%rax, %rax
000000000002727d	jne	0x272a3
000000000002727f	movq	0xa0(%rbx), %rax
0000000000027286	cmpb	$0x1, 0x2c(%rax)
000000000002728a	jne	0x2729b
000000000002728c	movq	%rbx, %rdi
000000000002728f	callq	__ZN7OZCurve22createLocalSplineStateEv ## OZCurve::createLocalSplineState()
0000000000027294	movq	%rax, 0xa0(%rbx)
000000000002729b	movq	%r14, %rdi
000000000002729e	callq	__ZN12OZSplineNode12createSplineEv ## OZSplineNode::createSpline()
00000000000272a3	movq	%r14, %rdi
00000000000272a6	callq	__ZNK12OZSplineNode9getSplineEv ## OZSplineNode::getSpline() const
00000000000272ab	movq	0x90(%rbx), %rsi
00000000000272b2	movsd	0x50(%rsi), %xmm0
00000000000272b7	addq	$0x14, %rsi
00000000000272bb	movq	0xa31fe(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000272c2	movq	%rax, %rdi
00000000000272c5	callq	__ZN8OZSpline22appendVertexNoTangentsERK6CMTimedS2_ ## OZSpline::appendVertexNoTangents(CMTime const&, double, CMTime const&)
00000000000272ca	movq	0x90(%rbx), %rcx
00000000000272d1	movq	%rax, (%rcx)
00000000000272d4	movl	0x8(%rcx), %edx
00000000000272d7	movq	(%rbx), %r8
00000000000272da	movq	%rbx, %rdi
00000000000272dd	movq	%rax, %rsi
00000000000272e0	movl	$0x1, %ecx
00000000000272e5	callq	*0x428(%r8)
00000000000272ec	jmp	0x27761
00000000000272f1	movq	0x90(%rbx), %rdx
00000000000272f8	addq	$0x60, %rdx
00000000000272fc	movq	%r14, %rdi
00000000000272ff	movq	%r15, %rsi
0000000000027302	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
0000000000027307	movq	(%rbx), %rax
000000000002730a	movq	0x90(%rbx), %rcx
0000000000027311	movq	(%rcx), %rsi
0000000000027314	movsd	0x60(%rcx), %xmm0
0000000000027319	movq	%rbx, %rdi
000000000002731c	movl	$0x1, %edx
0000000000027321	callq	*0x3c0(%rax)
0000000000027327	jmp	0x27761
000000000002732c	movq	0x90(%rbx), %rdx
0000000000027333	addq	$0x58, %rdx
0000000000027337	movq	%r14, %rdi
000000000002733a	movq	%r15, %rsi
000000000002733d	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
0000000000027342	movq	(%rbx), %rax
0000000000027345	movq	0x90(%rbx), %rcx
000000000002734c	movq	(%rcx), %rsi
000000000002734f	movsd	0x58(%rcx), %xmm0
0000000000027354	movq	%rbx, %rdi
0000000000027357	callq	*0x418(%rax)
000000000002735d	jmp	0x27761
0000000000027362	movq	0x90(%rbx), %rax
0000000000027369	testq	%rax, %rax
000000000002736c	je	0x273a1
000000000002736e	movq	(%rax), %rsi
0000000000027371	movl	0xc(%rax), %edx
0000000000027374	movq	(%rbx), %rax
0000000000027377	movq	%rbx, %rdi
000000000002737a	movl	$0x1, %ecx
000000000002737f	callq	*0x350(%rax)
0000000000027385	movq	0x90(%rbx), %rdi
000000000002738c	testq	%rdi, %rdi
000000000002738f	je	0x27396
0000000000027391	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000027396	movq	$0x0, 0x90(%rbx)
00000000000273a1	movl	$0x68, %edi
00000000000273a6	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000273ab	xorl	%edx, %edx
00000000000273ad	movq	%rdx, (%rax)
00000000000273b0	leaq	0x8(%rax), %rcx
00000000000273b4	movq	$0x4, 0x8(%rax)
00000000000273bc	movb	$0x1, 0x10(%rax)
00000000000273c0	movq	0xa30f9(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000273c7	movups	(%rsi), %xmm0
00000000000273ca	movups	%xmm0, 0x14(%rax)
00000000000273ce	movq	0x10(%rsi), %rsi
00000000000273d2	movq	%rsi, 0x24(%rax)
00000000000273d6	xorps	%xmm0, %xmm0
00000000000273d9	movups	%xmm0, 0x30(%rax)
00000000000273dd	movups	%xmm0, 0x40(%rax)
00000000000273e1	movq	%rdx, 0x50(%rax)
00000000000273e5	movsd	0x88fd3(%rip), %xmm0
00000000000273ed	movupd	%xmm0, 0x58(%rax)
00000000000273f2	movq	%rax, 0x90(%rbx)
00000000000273f9	movq	%r14, %rdi
00000000000273fc	movq	%r15, %rsi
00000000000273ff	movl	$0xa, %edx
0000000000027404	callq	0xacd50                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000027409	movq	0x90(%rbx), %rcx
0000000000027410	addq	$0x10, %rcx
0000000000027414	movq	%r14, %rdi
0000000000027417	movq	%r15, %rsi
000000000002741a	movl	$0x9, %edx
000000000002741f	callq	0xacd38                         ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
0000000000027424	movq	0x90(%rbx), %rcx
000000000002742b	addq	$0xc, %rcx
000000000002742f	movq	%r14, %rdi
0000000000027432	movq	%r15, %rsi
0000000000027435	movl	$0xb, %edx
000000000002743a	callq	0xacd50                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000002743f	movq	0x90(%rbx), %rax
0000000000027446	andl	$-0x21, 0xc(%rax)
000000000002744a	jmp	0x27761
000000000002744f	cmpl	$0x5, 0x68(%r14)
0000000000027454	jb	0x2764b
000000000002745a	leaq	-0x58(%rbp), %r12
000000000002745e	movq	%r14, %rdi
0000000000027461	movq	%r15, %rsi
0000000000027464	movq	%r12, %rdx
0000000000027467	callq	0xacc48                         ## symbol stub for: __ZN22PCSerializerReadStream12getAsFigTimeER15PCStreamElementP6CMTime
000000000002746c	movq	0x90(%rbx), %rax
0000000000027473	movupd	(%r12), %xmm0
0000000000027479	movupd	%xmm0, 0x14(%rax)
000000000002747e	movq	0x10(%r12), %rcx
0000000000027483	movq	%rcx, 0x24(%rax)
0000000000027487	jmp	0x27761
000000000002748c	movq	0x90(%rbx), %rdx
0000000000027493	addq	$0x40, %rdx
0000000000027497	movq	%r14, %rdi
000000000002749a	movq	%r15, %rsi
000000000002749d	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
00000000000274a2	cmpl	$0x4, 0x68(%r14)
00000000000274a7	ja	0x27761
00000000000274ad	movsd	0x88(%r14), %xmm0
00000000000274b6	movq	0x90(%rbx), %rax
00000000000274bd	mulsd	0x40(%rax), %xmm0
00000000000274c2	movsd	%xmm0, 0x40(%rax)
00000000000274c7	jmp	0x27761
00000000000274cc	leaq	-0x28(%rbp), %r12
00000000000274d0	movq	%r14, %rdi
00000000000274d3	movq	%r15, %rsi
00000000000274d6	movq	%r12, %rdx
00000000000274d9	callq	0xacc30                         ## symbol stub for: __ZN22PCSerializerReadStream10getAsInt32ER15PCStreamElementPi
00000000000274de	movl	(%r12), %esi
00000000000274e2	movq	(%rbx), %rax
00000000000274e5	movq	%rbx, %rdi
00000000000274e8	movl	$0x1, %edx
00000000000274ed	callq	*0x148(%rax)
00000000000274f3	jmp	0x27761
00000000000274f8	movq	0x90(%rbx), %rdx
00000000000274ff	addq	$0x30, %rdx
0000000000027503	movq	%r14, %rdi
0000000000027506	movq	%r15, %rsi
0000000000027509	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
000000000002750e	cmpl	$0x4, 0x68(%r14)
0000000000027513	ja	0x27761
0000000000027519	movsd	0x88(%r14), %xmm0
0000000000027522	movq	0x90(%rbx), %rax
0000000000027529	mulsd	0x30(%rax), %xmm0
000000000002752e	movsd	%xmm0, 0x30(%rax)
0000000000027533	jmp	0x27761
0000000000027538	addq	$0x78, %rbx
000000000002753c	movq	%r14, %rdi
000000000002753f	movq	%r15, %rsi
0000000000027542	movq	%rbx, %rdx
0000000000027545	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
000000000002754a	jmp	0x27761
000000000002754f	movq	0x90(%rbx), %rdx
0000000000027556	addq	$0x38, %rdx
000000000002755a	movq	%r14, %rdi
000000000002755d	movq	%r15, %rsi
0000000000027560	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
0000000000027565	movq	0x90(%rbx), %rax
000000000002756c	movq	0xa0(%rbx), %rcx
0000000000027573	cmpb	$0x0, 0x2(%rcx)
0000000000027577	jne	0x27583
0000000000027579	cmpl	$0x12, 0x8(%rax)
000000000002757d	jne	0x27761
0000000000027583	movq	(%rax), %rsi
0000000000027586	movsd	0x30(%rax), %xmm0
000000000002758b	movsd	0x38(%rax), %xmm1
0000000000027590	movq	(%rbx), %rax
0000000000027593	movq	%rbx, %rdi
0000000000027596	movl	$0x1, %edx
000000000002759b	callq	*0x3d8(%rax)
00000000000275a1	jmp	0x27761
00000000000275a6	leaq	-0x28(%rbp), %r12
00000000000275aa	movq	%r14, %rdi
00000000000275ad	movq	%r15, %rsi
00000000000275b0	movq	%r12, %rdx
00000000000275b3	callq	0xacc30                         ## symbol stub for: __ZN22PCSerializerReadStream10getAsInt32ER15PCStreamElementPi
00000000000275b8	cmpl	$0x0, (%r12)
00000000000275bd	je	0x27761
00000000000275c3	movq	(%rbx), %rax
00000000000275c6	movq	%rbx, %rdi
00000000000275c9	callq	*0x78(%rax)
00000000000275cc	jmp	0x27761
00000000000275d1	movq	0x90(%rbx), %rdx
00000000000275d8	addq	$0x48, %rdx
00000000000275dc	movq	%r14, %rdi
00000000000275df	movq	%r15, %rsi
00000000000275e2	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
00000000000275e7	movq	0x90(%rbx), %rax
00000000000275ee	movq	0xa0(%rbx), %rcx
00000000000275f5	cmpb	$0x0, 0x2(%rcx)
00000000000275f9	jne	0x27601
00000000000275fb	cmpl	$0x12, 0x8(%rax)
00000000000275ff	jne	0x27626
0000000000027601	movq	(%rax), %rsi
0000000000027604	movsd	0x40(%rax), %xmm0
0000000000027609	movsd	0x48(%rax), %xmm1
000000000002760e	movq	(%rbx), %rax
0000000000027611	movq	%rbx, %rdi
0000000000027614	movl	$0x1, %edx
0000000000027619	callq	*0x3e0(%rax)
000000000002761f	movq	0x90(%rbx), %rax
0000000000027626	cmpb	$0x0, 0x10(%rax)
000000000002762a	jne	0x27761
0000000000027630	movq	(%rax), %rsi
0000000000027633	movq	(%rbx), %rax
0000000000027636	movq	%rbx, %rdi
0000000000027639	xorl	%edx, %edx
000000000002763b	movl	$0x1, %ecx
0000000000027640	callq	*0x358(%rax)
0000000000027646	jmp	0x27761
000000000002764b	leaq	-0x40(%rbp), %r12
000000000002764f	movq	%r14, %rdi
0000000000027652	movq	%r15, %rsi
0000000000027655	movq	%r12, %rdx
0000000000027658	callq	0xacc36                         ## symbol stub for: __ZN22PCSerializerReadStream11getAsDoubleER15PCStreamElementPd
000000000002765d	movq	0x80(%r14), %rax
0000000000027664	leaq	-0x70(%rbp), %rsi
0000000000027668	movq	%rax, 0x10(%rsi)
000000000002766c	movups	0x70(%r14), %xmm0
0000000000027671	movaps	%xmm0, (%rsi)
0000000000027674	movsd	(%r12), %xmm0
000000000002767a	leaq	-0x58(%rbp), %r14
000000000002767e	movq	%r14, %rdi
0000000000027681	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000027686	movq	0x90(%rbx), %rax
000000000002768d	movq	0x10(%r14), %rcx
0000000000027691	movq	%rcx, 0x24(%rax)
0000000000027695	movupd	(%r14), %xmm0
000000000002769a	movupd	%xmm0, 0x14(%rax)
000000000002769f	jmp	0x27761
00000000000276a4	xorl	%esi, %esi
00000000000276a6	callq	*%rax
00000000000276a8	leaq	-0x30(%rbp), %rcx
00000000000276ac	movq	%r14, %rdi
00000000000276af	movq	%r15, %rsi
00000000000276b2	movl	$0x1, %edx
00000000000276b7	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
00000000000276bc	testb	%al, %al
00000000000276be	je	0x276ca
00000000000276c0	movsd	-0x30(%rbp), %xmm0
00000000000276c5	movsd	%xmm0, 0x18(%rbx)
00000000000276ca	leaq	-0x30(%rbp), %rcx
00000000000276ce	movq	%r14, %rdi
00000000000276d1	movq	%r15, %rsi
00000000000276d4	movl	$0x8, %edx
00000000000276d9	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
00000000000276de	testb	%al, %al
00000000000276e0	je	0x276ec
00000000000276e2	movsd	-0x30(%rbp), %xmm0
00000000000276e7	movsd	%xmm0, 0x20(%rbx)
00000000000276ec	leaq	-0x21(%rbp), %rcx
00000000000276f0	movq	%r14, %rdi
00000000000276f3	movq	%r15, %rsi
00000000000276f6	movl	$0x5, %edx
00000000000276fb	callq	0xacd38                         ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
0000000000027700	testb	%al, %al
0000000000027702	je	0x27711
0000000000027704	movzbl	-0x21(%rbp), %esi
0000000000027708	movq	(%rbx), %rax
000000000002770b	movq	%rbx, %rdi
000000000002770e	callq	*0x68(%rax)
0000000000027711	leaq	-0x21(%rbp), %rcx
0000000000027715	movq	%r14, %rdi
0000000000027718	movq	%r15, %rsi
000000000002771b	movl	$0x6, %edx
0000000000027720	callq	0xacd38                         ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
0000000000027725	testb	%al, %al
0000000000027727	je	0x27739
0000000000027729	movzbl	-0x21(%rbp), %esi
000000000002772d	movq	(%rbx), %rax
0000000000027730	movq	%rbx, %rdi
0000000000027733	callq	*0xa8(%rax)
0000000000027739	leaq	-0x21(%rbp), %rcx
000000000002773d	movq	%r14, %rdi
0000000000027740	movq	%r15, %rsi
0000000000027743	movl	$0x7, %edx
0000000000027748	callq	0xacd38                         ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
000000000002774d	testb	%al, %al
000000000002774f	je	0x27761
0000000000027751	movzbl	-0x21(%rbp), %esi
0000000000027755	movq	(%rbx), %rax
0000000000027758	movq	%rbx, %rdi
000000000002775b	callq	*0x158(%rax)
0000000000027761	movb	$0x1, %al
0000000000027763	addq	$0x50, %rsp
0000000000027767	popq	%rbx
0000000000027768	popq	%r12
000000000002776a	popq	%r14
000000000002776c	popq	%r15
000000000002776e	popq	%rbp
000000000002776f	retq
0000000000027770	xchgl	%edi, %eax
0000000000027771	stc
0000000000027772	.byte 0xff #bad opcode
0000000000027773	lcalll	*-0x1(%rbp,%rdi,8)
0000000000027777	pushq	%rdx
0000000000027779	sti
000000000002777a	.byte 0xff #bad opcode
000000000002777b	.byte 0xff #bad opcode
000000000002777c	.byte 0xdf #bad opcode
000000000002777d	cld
000000000002777e	.byte 0xff #bad opcode
000000000002777f	.byte 0xff #bad opcode
0000000000027780	callq	0xffffffff8902777f
0000000000027785	std
0000000000027786	.byte 0xff #bad opcode
0000000000027787	.byte 0xff #bad opcode
0000000000027788	.byte 0xdf #bad opcode
0000000000027789	std
000000000002778a	.byte 0xff #bad opcode
000000000002778b	lcalll	*-0x19e0001(,%rdi,8)
0000000000027792	.byte 0xff #bad opcode
0000000000027793	.byte 0xff #bad opcode
0000000000027794	movl	$0x36fffffb, %esp               ## imm = 0x36FFFFFB
0000000000027799	.byte 0xfe #bad opcode
000000000002779a	.byte 0xff #bad opcode
000000000002779b	lcalll	*-0x6(%rcx)
000000000002779e	.byte 0xff #bad opcode
000000000002779f	incl	-0x37000005(%rcx)
00000000000277a5	std
00000000000277a6	.byte 0xff #bad opcode
00000000000277a7	callq	*-0x6(%rax)
00000000000277aa	.byte 0xff #bad opcode
00000000000277ab	callq	*0x48(%rbp)
00000000000277ae	movl	%esp, %ebp
00000000000277b0	xorl	%eax, %eax
00000000000277b2	popq	%rbp
00000000000277b3	retq
