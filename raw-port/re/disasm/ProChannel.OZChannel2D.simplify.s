__ZN11OZChannel2D8simplifyERK6CMTimeS2_S2_djjb:
00000000000480ba	pushq	%rbp
00000000000480bb	movq	%rsp, %rbp
00000000000480be	pushq	%r15
00000000000480c0	pushq	%r14
00000000000480c2	pushq	%r13
00000000000480c4	pushq	%r12
00000000000480c6	pushq	%rbx
00000000000480c7	subq	$0x138, %rsp                    ## imm = 0x138
00000000000480ce	movq	%rdx, %r14
00000000000480d1	movq	%rdi, %rbx
00000000000480d4	cmpl	$0x4, %r8d
00000000000480d8	movq	%rsi, -0x108(%rbp)
00000000000480df	movq	%rdi, -0x48(%rbp)
00000000000480e3	jne	0x48686
00000000000480e9	xorps	%xmm0, %xmm0
00000000000480ec	movaps	%xmm0, -0x60(%rbp)
00000000000480f0	xorl	%eax, %eax
00000000000480f2	movq	%rax, -0x50(%rbp)
00000000000480f6	movq	%rax, -0x70(%rbp)
00000000000480fa	movaps	%xmm0, -0x80(%rbp)
00000000000480fe	movq	0x823bb(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000048105	movq	0x10(%rcx), %rax
0000000000048109	movq	%rax, -0x90(%rbp)
0000000000048110	movupd	(%rcx), %xmm0
0000000000048114	movapd	%xmm0, -0xa0(%rbp)
000000000004811c	movq	0x70(%rbx), %r13
0000000000048120	testq	%r13, %r13
0000000000048123	je	0x48956
0000000000048129	movq	%r14, -0x130(%rbp)
0000000000048130	movq	(%r13), %r14
0000000000048134	cmpq	%r14, 0x8(%r13)
0000000000048138	je	0x482d5
000000000004813e	xorl	%ebx, %ebx
0000000000048140	movq	(%r14,%rbx,8), %rdi
0000000000048144	testq	%rdi, %rdi
0000000000048147	je	0x48273
000000000004814d	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000048154	leaq	__ZTI9OZChannel(%rip), %rdx     ## typeinfo for OZChannel
000000000004815b	xorl	%ecx, %ecx
000000000004815d	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000048162	testq	%rax, %rax
0000000000048165	je	0x48273
000000000004816b	movq	%rax, %r15
000000000004816e	leaq	-0xd0(%rbp), %rdi
0000000000048175	movq	%rax, %rsi
0000000000048178	xorl	%edx, %edx
000000000004817a	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
000000000004817f	movq	-0xd0(%rbp), %rdi
0000000000048186	cmpq	%rdi, -0xc8(%rbp)
000000000004818d	je	0x48256
0000000000048193	xorl	%r13d, %r13d
0000000000048196	movq	(%rdi,%r13,8), %rsi
000000000004819a	movq	%r15, %rdi
000000000004819d	leaq	-0xa0(%rbp), %rdx
00000000000481a4	xorl	%ecx, %ecx
00000000000481a6	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
00000000000481ab	movq	-0x60(%rbp), %r14
00000000000481af	movq	-0x58(%rbp), %r12
00000000000481b3	cmpq	%r12, %r14
00000000000481b6	je	0x4820c
00000000000481b8	movq	0x10(%r14), %rax
00000000000481bc	movq	%rax, -0x30(%rbp)
00000000000481c0	movups	(%r14), %xmm0
00000000000481c4	movaps	%xmm0, -0x40(%rbp)
00000000000481c8	movq	-0x90(%rbp), %rax
00000000000481cf	movq	%rax, 0x28(%rsp)
00000000000481d4	movaps	-0xa0(%rbp), %xmm0
00000000000481db	movups	%xmm0, 0x18(%rsp)
00000000000481e0	movq	-0x30(%rbp), %rax
00000000000481e4	movq	%rax, 0x10(%rsp)
00000000000481e9	movapd	-0x40(%rbp), %xmm0
00000000000481ee	movupd	%xmm0, (%rsp)
00000000000481f3	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000481f8	testl	%eax, %eax
00000000000481fa	je	0x48208
00000000000481fc	addq	$0x18, %r14
0000000000048200	cmpq	%r12, %r14
0000000000048203	jne	0x481b8
0000000000048205	movq	%r12, %r14
0000000000048208	movq	-0x58(%rbp), %r12
000000000004820c	cmpq	%r12, %r14
000000000004820f	jne	0x48235
0000000000048211	leaq	-0x60(%rbp), %rdi
0000000000048215	leaq	-0xa0(%rbp), %rsi
000000000004821c	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
0000000000048221	testl	%ebx, %ebx
0000000000048223	je	0x48235
0000000000048225	leaq	-0x80(%rbp), %rdi
0000000000048229	leaq	-0xa0(%rbp), %rsi
0000000000048230	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
0000000000048235	incl	%r13d
0000000000048238	movq	-0xd0(%rbp), %rdi
000000000004823f	movq	-0xc8(%rbp), %rax
0000000000048246	subq	%rdi, %rax
0000000000048249	sarq	$0x3, %rax
000000000004824d	cmpq	%r13, %rax
0000000000048250	ja	0x48196
0000000000048256	testq	%rdi, %rdi
0000000000048259	je	0x48267
000000000004825b	movq	%rdi, -0xc8(%rbp)
0000000000048262	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048267	movq	-0x48(%rbp), %rax
000000000004826b	movq	0x70(%rax), %r13
000000000004826f	movq	(%r13), %r14
0000000000048273	incl	%ebx
0000000000048275	movq	0x8(%r13), %rax
0000000000048279	subq	%r14, %rax
000000000004827c	sarq	$0x3, %rax
0000000000048280	cmpq	%rbx, %rax
0000000000048283	ja	0x48140
0000000000048289	movq	-0x80(%rbp), %rax
000000000004828d	cmpq	%rax, -0x78(%rbp)
0000000000048291	je	0x482d5
0000000000048293	movl	$0x1, %ebx
0000000000048298	xorl	%ecx, %ecx
000000000004829a	movabsq	$-0x5555555555555555, %r14      ## imm = 0xAAAAAAAAAAAAAAAB
00000000000482a4	leaq	(%rcx,%rcx,2), %rcx
00000000000482a8	leaq	(%rax,%rcx,8), %rsi
00000000000482ac	movq	-0x48(%rbp), %rdi
00000000000482b0	movq	(%rdi), %rax
00000000000482b3	callq	*0x258(%rax)
00000000000482b9	movl	%ebx, %ecx
00000000000482bb	movq	-0x80(%rbp), %rax
00000000000482bf	movq	-0x78(%rbp), %rdx
00000000000482c3	subq	%rax, %rdx
00000000000482c6	sarq	$0x3, %rdx
00000000000482ca	imulq	%r14, %rdx
00000000000482ce	incl	%ebx
00000000000482d0	cmpq	%rcx, %rdx
00000000000482d3	ja	0x482a4
00000000000482d5	xorl	%eax, %eax
00000000000482d7	movq	%rax, -0xe0(%rbp)
00000000000482de	movq	%rax, -0xd8(%rbp)
00000000000482e5	movq	%rax, -0x128(%rbp)
00000000000482ec	movq	%rax, -0x120(%rbp)
00000000000482f3	movq	%rax, -0x118(%rbp)
00000000000482fa	movq	%rax, -0x110(%rbp)
0000000000048301	movq	0x821b8(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000048308	movq	0x10(%rcx), %rax
000000000004830c	movq	%rax, -0xc0(%rbp)
0000000000048313	movupd	(%rcx), %xmm0
0000000000048317	movapd	%xmm0, -0xd0(%rbp)
000000000004831f	movq	-0x48(%rbp), %r14
0000000000048323	leaq	0x88(%r14), %rsi
000000000004832a	leaq	-0xb8(%rbp), %rdi
0000000000048331	movq	%rsi, -0x68(%rbp)
0000000000048335	xorl	%edx, %edx
0000000000048337	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
000000000004833c	addq	$0x120, %r14                    ## imm = 0x120
0000000000048343	leaq	-0xf8(%rbp), %rdi
000000000004834a	movq	%r14, %rsi
000000000004834d	xorl	%edx, %edx
000000000004834f	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000048354	movq	-0xb8(%rbp), %rdi
000000000004835b	cmpq	%rdi, -0xb0(%rbp)
0000000000048362	je	0x48911
0000000000048368	movq	(%rdi), %rsi
000000000004836b	leaq	-0xe0(%rbp), %rcx
0000000000048372	movq	-0x68(%rbp), %rdi
0000000000048376	xorl	%edx, %edx
0000000000048378	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000004837d	movq	-0xf8(%rbp), %rax
0000000000048384	movq	(%rax), %rsi
0000000000048387	leaq	-0xd8(%rbp), %rcx
000000000004838e	movq	%r14, %rdi
0000000000048391	xorl	%edx, %edx
0000000000048393	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000048398	movq	-0xb8(%rbp), %rdi
000000000004839f	movq	-0xb0(%rbp), %rax
00000000000483a6	subq	%rdi, %rax
00000000000483a9	sarq	$0x3, %rax
00000000000483ad	addq	$-0x3, %rax
00000000000483b1	cmpq	$-0x3, %rax
00000000000483b5	ja	0x48911
00000000000483bb	movq	-0xf8(%rbp), %rax
00000000000483c2	movq	(%rax), %rax
00000000000483c5	movq	%rax, -0x100(%rbp)
00000000000483cc	movq	(%rdi), %rax
00000000000483cf	movq	%rax, -0x48(%rbp)
00000000000483d3	movl	$0x1, %r15d
00000000000483d9	movl	$0x1, %r12d
00000000000483df	movl	$0x2, %r13d
00000000000483e5	movq	(%rdi,%r12,8), %rsi
00000000000483e9	movq	-0x68(%rbp), %rdi
00000000000483ed	leaq	-0xd0(%rbp), %rdx
00000000000483f4	leaq	-0x118(%rbp), %rcx
00000000000483fb	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000048400	movq	-0xf8(%rbp), %rax
0000000000048407	movq	(%rax,%r12,8), %rsi
000000000004840b	movq	%r14, %rdi
000000000004840e	xorl	%edx, %edx
0000000000048410	leaq	-0x110(%rbp), %rcx
0000000000048417	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000004841c	movq	-0x108(%rbp), %rcx
0000000000048423	movq	0x10(%rcx), %rax
0000000000048427	movq	%rax, -0x30(%rbp)
000000000004842b	movups	(%rcx), %xmm0
000000000004842e	movaps	%xmm0, -0x40(%rbp)
0000000000048432	movq	-0x30(%rbp), %rax
0000000000048436	movq	%rax, 0x28(%rsp)
000000000004843b	movaps	-0x40(%rbp), %xmm0
000000000004843f	movups	%xmm0, 0x18(%rsp)
0000000000048444	movq	-0xc0(%rbp), %rax
000000000004844b	movq	%rax, 0x10(%rsp)
0000000000048450	movapd	-0xd0(%rbp), %xmm0
0000000000048458	movupd	%xmm0, (%rsp)
000000000004845d	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000048462	testl	%eax, %eax
0000000000048464	js	0x484b0
0000000000048466	movq	-0x130(%rbp), %rcx
000000000004846d	movq	0x10(%rcx), %rax
0000000000048471	movq	%rax, -0x30(%rbp)
0000000000048475	movups	(%rcx), %xmm0
0000000000048478	movaps	%xmm0, -0x40(%rbp)
000000000004847c	movq	-0x30(%rbp), %rax
0000000000048480	movq	%rax, 0x28(%rsp)
0000000000048485	movaps	-0x40(%rbp), %xmm0
0000000000048489	movups	%xmm0, 0x18(%rsp)
000000000004848e	movq	-0xc0(%rbp), %rax
0000000000048495	movq	%rax, 0x10(%rsp)
000000000004849a	movapd	-0xd0(%rbp), %xmm0
00000000000484a2	movupd	%xmm0, (%rsp)
00000000000484a7	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000484ac	testl	%eax, %eax
00000000000484ae	jle	0x4851c
00000000000484b0	movsd	-0x118(%rbp), %xmm0
00000000000484b8	movsd	%xmm0, -0xe0(%rbp)
00000000000484c0	movsd	-0x110(%rbp), %xmm0
00000000000484c8	movsd	%xmm0, -0xd8(%rbp)
00000000000484d0	movq	-0xb8(%rbp), %rdi
00000000000484d7	movq	(%rdi,%r12,8), %rax
00000000000484db	movq	%rax, -0x48(%rbp)
00000000000484df	movq	-0xf8(%rbp), %rax
00000000000484e6	movq	(%rax,%r12,8), %rax
00000000000484ea	movq	%rax, -0x100(%rbp)
00000000000484f1	incl	%r15d
00000000000484f4	movl	%r13d, %ebx
00000000000484f7	movq	-0xb0(%rbp), %rax
00000000000484fe	subq	%rdi, %rax
0000000000048501	sarq	$0x3, %rax
0000000000048505	decq	%rax
0000000000048508	incl	%r13d
000000000004850b	movq	%rbx, %r12
000000000004850e	cmpq	%rbx, %rax
0000000000048511	ja	0x483e5
0000000000048517	jmp	0x48911
000000000004851c	movl	%r13d, %ebx
000000000004851f	movq	-0xb8(%rbp), %rax
0000000000048526	movq	(%rax,%rbx,8), %rsi
000000000004852a	movq	-0x68(%rbp), %rdi
000000000004852e	xorl	%edx, %edx
0000000000048530	leaq	-0x128(%rbp), %rcx
0000000000048537	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000004853c	movq	-0xf8(%rbp), %rax
0000000000048543	movq	(%rax,%rbx,8), %rsi
0000000000048547	movq	%r14, %rdi
000000000004854a	xorl	%edx, %edx
000000000004854c	leaq	-0x120(%rbp), %rcx
0000000000048553	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000048558	incl	%r15d
000000000004855b	movsd	-0x110(%rbp), %xmm0
0000000000048563	movapd	%xmm0, %xmm2
0000000000048567	subsd	-0xd8(%rbp), %xmm2
000000000004856f	movsd	-0x118(%rbp), %xmm1
0000000000048577	movapd	%xmm1, %xmm3
000000000004857b	subsd	-0xe0(%rbp), %xmm3
0000000000048583	divsd	%xmm3, %xmm2
0000000000048587	movsd	-0x120(%rbp), %xmm3
000000000004858f	subsd	%xmm0, %xmm3
0000000000048593	movsd	-0x128(%rbp), %xmm4
000000000004859b	subsd	%xmm1, %xmm4
000000000004859f	divsd	%xmm4, %xmm3
00000000000485a3	xorpd	%xmm4, %xmm4
00000000000485a7	ucomisd	%xmm4, %xmm2
00000000000485ab	jbe	0x485b3
00000000000485ad	ucomisd	%xmm3, %xmm4
00000000000485b1	ja	0x485bf
00000000000485b3	ucomisd	%xmm2, %xmm4
00000000000485b7	jbe	0x485f5
00000000000485b9	ucomisd	%xmm4, %xmm3
00000000000485bd	jbe	0x485f5
00000000000485bf	movsd	%xmm1, -0xe0(%rbp)
00000000000485c7	movsd	%xmm0, -0xd8(%rbp)
00000000000485cf	movq	-0xb8(%rbp), %rdi
00000000000485d6	movq	(%rdi,%r12,8), %rax
00000000000485da	movq	%rax, -0x48(%rbp)
00000000000485de	movq	-0xf8(%rbp), %rax
00000000000485e5	movq	(%rax,%r12,8), %rax
00000000000485e9	movq	%rax, -0x100(%rbp)
00000000000485f0	jmp	0x484f7
00000000000485f5	movq	-0x68(%rbp), %rdi
00000000000485f9	movl	$0x1, %esi
00000000000485fe	callq	__ZN9OZChannel14willBeModifiedEj ## OZChannel::willBeModified(unsigned int)
0000000000048603	movq	-0xb8(%rbp), %rax
000000000004860a	movq	(%rax,%r12,8), %rsi
000000000004860e	movq	-0x68(%rbp), %rdi
0000000000048612	callq	__ZN9OZChannel14deleteKeyframeEPv ## OZChannel::deleteKeyframe(void*)
0000000000048617	movq	%r14, %rdi
000000000004861a	movl	$0x1, %esi
000000000004861f	callq	__ZN9OZChannel14willBeModifiedEj ## OZChannel::willBeModified(unsigned int)
0000000000048624	movq	-0xf8(%rbp), %rax
000000000004862b	movq	(%rax,%r12,8), %rsi
000000000004862f	movq	%r14, %rdi
0000000000048632	callq	__ZN9OZChannel14deleteKeyframeEPv ## OZChannel::deleteKeyframe(void*)
0000000000048637	movq	-0x68(%rbp), %rdi
000000000004863b	movq	-0x48(%rbp), %rsi
000000000004863f	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
0000000000048644	movq	%r14, %rdi
0000000000048647	movq	-0x100(%rbp), %rsi
000000000004864e	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
0000000000048653	movq	-0xb8(%rbp), %rax
000000000004865a	movq	(%rax,%rbx,8), %rsi
000000000004865e	movq	-0x68(%rbp), %rdi
0000000000048662	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
0000000000048667	movq	-0xf8(%rbp), %rax
000000000004866e	movq	(%rax,%rbx,8), %rsi
0000000000048672	movq	%r14, %rdi
0000000000048675	callq	__ZN9OZChannel14deriveKeyframeEPv ## OZChannel::deriveKeyframe(void*)
000000000004867a	movq	-0xb8(%rbp), %rdi
0000000000048681	jmp	0x484f7
0000000000048686	movzbl	0x10(%rbp), %eax
000000000004868a	movl	%eax, (%rsp)
000000000004868d	movq	%rbx, %rdi
0000000000048690	movq	%r14, %rdx
0000000000048693	callq	__ZN15OZChannelFolder8simplifyERK6CMTimeS2_S2_djjb ## OZChannelFolder::simplify(CMTime const&, CMTime const&, CMTime const&, double, unsigned int, unsigned int, bool)
0000000000048698	movq	0x81e21(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000004869f	movq	0x10(%rax), %rcx
00000000000486a3	movq	%rcx, -0x50(%rbp)
00000000000486a7	movupd	(%rax), %xmm0
00000000000486ab	movapd	%xmm0, -0x60(%rbp)
00000000000486b0	leaq	0x88(%rbx), %r12
00000000000486b7	leaq	-0x80(%rbp), %rdi
00000000000486bb	movq	%r12, %rsi
00000000000486be	xorl	%edx, %edx
00000000000486c0	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
00000000000486c5	leaq	0x120(%rbx), %r13
00000000000486cc	leaq	-0xa0(%rbp), %rdi
00000000000486d3	movq	%r13, %rsi
00000000000486d6	xorl	%edx, %edx
00000000000486d8	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
00000000000486dd	movq	-0x78(%rbp), %rax
00000000000486e1	cmpq	-0x80(%rbp), %rax
00000000000486e5	je	0x487de
00000000000486eb	movl	$0x1, %ebx
00000000000486f0	xorl	%r15d, %r15d
00000000000486f3	movq	-0x108(%rbp), %rcx
00000000000486fa	movq	0x10(%rcx), %rax
00000000000486fe	movq	%rax, -0x30(%rbp)
0000000000048702	movups	(%rcx), %xmm0
0000000000048705	movaps	%xmm0, -0x40(%rbp)
0000000000048709	movq	-0x30(%rbp), %rax
000000000004870d	movq	%rax, 0x28(%rsp)
0000000000048712	movaps	-0x40(%rbp), %xmm0
0000000000048716	movups	%xmm0, 0x18(%rsp)
000000000004871b	movq	-0x50(%rbp), %rax
000000000004871f	movq	%rax, 0x10(%rsp)
0000000000048724	movapd	-0x60(%rbp), %xmm0
0000000000048729	movupd	%xmm0, (%rsp)
000000000004872e	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000048733	testl	%eax, %eax
0000000000048735	js	0x487c4
000000000004873b	movq	0x10(%r14), %rax
000000000004873f	movq	%rax, -0x30(%rbp)
0000000000048743	movups	(%r14), %xmm0
0000000000048747	movaps	%xmm0, -0x40(%rbp)
000000000004874b	movq	-0x30(%rbp), %rax
000000000004874f	movq	%rax, 0x28(%rsp)
0000000000048754	movaps	-0x40(%rbp), %xmm0
0000000000048758	movups	%xmm0, 0x18(%rsp)
000000000004875d	movq	-0x50(%rbp), %rax
0000000000048761	movq	%rax, 0x10(%rsp)
0000000000048766	movapd	-0x60(%rbp), %xmm0
000000000004876b	movupd	%xmm0, (%rsp)
0000000000048770	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000048775	testl	%eax, %eax
0000000000048777	jg	0x487c4
0000000000048779	movq	-0x80(%rbp), %rax
000000000004877d	movq	(%rax,%r15,8), %rsi
0000000000048781	movq	%r12, %rdi
0000000000048784	leaq	-0x60(%rbp), %rdx
0000000000048788	xorl	%ecx, %ecx
000000000004878a	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000004878f	movq	-0x48(%rbp), %rsi
0000000000048793	movq	(%rsi), %rax
0000000000048796	leaq	-0x40(%rbp), %r15
000000000004879a	movq	%r15, %rdi
000000000004879d	leaq	-0x60(%rbp), %rdx
00000000000487a1	callq	*0x150(%rax)
00000000000487a7	movq	%r13, %rdi
00000000000487aa	movq	%r15, %rsi
00000000000487ad	xorl	%edx, %edx
00000000000487af	callq	__ZNK9OZChannel13hasKeypointAtERK6CMTimej ## OZChannel::hasKeypointAt(CMTime const&, unsigned int) const
00000000000487b4	testb	%al, %al
00000000000487b6	jne	0x487c4
00000000000487b8	movq	%r13, %rdi
00000000000487bb	leaq	-0x60(%rbp), %rsi
00000000000487bf	callq	__ZN9OZChannel11setKeyframeERK6CMTime ## OZChannel::setKeyframe(CMTime const&)
00000000000487c4	movq	-0x78(%rbp), %rax
00000000000487c8	subq	-0x80(%rbp), %rax
00000000000487cc	movl	%ebx, %r15d
00000000000487cf	sarq	$0x3, %rax
00000000000487d3	incl	%ebx
00000000000487d5	cmpq	%r15, %rax
00000000000487d8	ja	0x486f3
00000000000487de	movq	-0xa0(%rbp), %rdi
00000000000487e5	cmpq	%rdi, -0x98(%rbp)
00000000000487ec	je	0x488f1
00000000000487f2	movl	$0x1, %ebx
00000000000487f7	xorl	%r15d, %r15d
00000000000487fa	movq	-0x108(%rbp), %rcx
0000000000048801	movq	0x10(%rcx), %rax
0000000000048805	movq	%rax, -0x30(%rbp)
0000000000048809	movups	(%rcx), %xmm0
000000000004880c	movaps	%xmm0, -0x40(%rbp)
0000000000048810	movq	-0x30(%rbp), %rax
0000000000048814	movq	%rax, 0x28(%rsp)
0000000000048819	movaps	-0x40(%rbp), %xmm0
000000000004881d	movups	%xmm0, 0x18(%rsp)
0000000000048822	movq	-0x50(%rbp), %rax
0000000000048826	movq	%rax, 0x10(%rsp)
000000000004882b	movapd	-0x60(%rbp), %xmm0
0000000000048830	movupd	%xmm0, (%rsp)
0000000000048835	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000004883a	testl	%eax, %eax
000000000004883c	js	0x488ce
0000000000048842	movq	0x10(%r14), %rax
0000000000048846	movq	%rax, -0x30(%rbp)
000000000004884a	movups	(%r14), %xmm0
000000000004884e	movaps	%xmm0, -0x40(%rbp)
0000000000048852	movq	-0x30(%rbp), %rax
0000000000048856	movq	%rax, 0x28(%rsp)
000000000004885b	movaps	-0x40(%rbp), %xmm0
000000000004885f	movups	%xmm0, 0x18(%rsp)
0000000000048864	movq	-0x50(%rbp), %rax
0000000000048868	movq	%rax, 0x10(%rsp)
000000000004886d	movapd	-0x60(%rbp), %xmm0
0000000000048872	movupd	%xmm0, (%rsp)
0000000000048877	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000004887c	testl	%eax, %eax
000000000004887e	jg	0x488ce
0000000000048880	movq	-0xa0(%rbp), %rax
0000000000048887	movq	(%rax,%r15,8), %rsi
000000000004888b	movq	%r13, %rdi
000000000004888e	leaq	-0x60(%rbp), %rdx
0000000000048892	xorl	%ecx, %ecx
0000000000048894	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000048899	movq	-0x48(%rbp), %rsi
000000000004889d	movq	(%rsi), %rax
00000000000488a0	leaq	-0x40(%rbp), %r15
00000000000488a4	movq	%r15, %rdi
00000000000488a7	leaq	-0x60(%rbp), %rdx
00000000000488ab	callq	*0x150(%rax)
00000000000488b1	movq	%r12, %rdi
00000000000488b4	movq	%r15, %rsi
00000000000488b7	xorl	%edx, %edx
00000000000488b9	callq	__ZNK9OZChannel13hasKeypointAtERK6CMTimej ## OZChannel::hasKeypointAt(CMTime const&, unsigned int) const
00000000000488be	testb	%al, %al
00000000000488c0	jne	0x488ce
00000000000488c2	movq	%r12, %rdi
00000000000488c5	leaq	-0x60(%rbp), %rsi
00000000000488c9	callq	__ZN9OZChannel11setKeyframeERK6CMTime ## OZChannel::setKeyframe(CMTime const&)
00000000000488ce	movl	%ebx, %r15d
00000000000488d1	movq	-0xa0(%rbp), %rdi
00000000000488d8	movq	-0x98(%rbp), %rax
00000000000488df	subq	%rdi, %rax
00000000000488e2	sarq	$0x3, %rax
00000000000488e6	incl	%ebx
00000000000488e8	cmpq	%r15, %rax
00000000000488eb	ja	0x487fa
00000000000488f1	testq	%rdi, %rdi
00000000000488f4	je	0x48902
00000000000488f6	movq	%rdi, -0x98(%rbp)
00000000000488fd	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048902	movq	-0x80(%rbp), %rdi
0000000000048906	testq	%rdi, %rdi
0000000000048909	je	0x48968
000000000004890b	movq	%rdi, -0x78(%rbp)
000000000004890f	jmp	0x48963
0000000000048911	movq	-0xf8(%rbp), %rax
0000000000048918	testq	%rax, %rax
000000000004891b	je	0x48933
000000000004891d	movq	%rax, -0xf0(%rbp)
0000000000048924	movq	%rax, %rdi
0000000000048927	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000004892c	movq	-0xb8(%rbp), %rdi
0000000000048933	testq	%rdi, %rdi
0000000000048936	je	0x48944
0000000000048938	movq	%rdi, -0xb0(%rbp)
000000000004893f	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048944	movq	-0x80(%rbp), %rdi
0000000000048948	testq	%rdi, %rdi
000000000004894b	je	0x48956
000000000004894d	movq	%rdi, -0x78(%rbp)
0000000000048951	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048956	movq	-0x60(%rbp), %rdi
000000000004895a	testq	%rdi, %rdi
000000000004895d	je	0x48968
000000000004895f	movq	%rdi, -0x58(%rbp)
0000000000048963	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048968	addq	$0x138, %rsp                    ## imm = 0x138
000000000004896f	popq	%rbx
0000000000048970	popq	%r12
0000000000048972	popq	%r13
0000000000048974	popq	%r14
0000000000048976	popq	%r15
0000000000048978	popq	%rbp
0000000000048979	retq
000000000004897a	movq	%rax, %rbx
000000000004897d	jmp	0x489ae
000000000004897f	jmp	0x4898a
0000000000048981	jmp	0x48993
0000000000048983	movq	%rax, %rbx
0000000000048986	jmp	0x489e0
0000000000048988	jmp	0x4898a
000000000004898a	movq	%rax, %rbx
000000000004898d	jmp	0x48a0c
000000000004898f	jmp	0x489c5
0000000000048991	jmp	0x489c5
0000000000048993	movq	%rax, %rbx
0000000000048996	movq	-0xf8(%rbp), %rdi
000000000004899d	testq	%rdi, %rdi
00000000000489a0	je	0x489ae
00000000000489a2	movq	%rdi, -0xf0(%rbp)
00000000000489a9	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000489ae	movq	-0xb8(%rbp), %rdi
00000000000489b5	testq	%rdi, %rdi
00000000000489b8	je	0x48a0c
00000000000489ba	movq	%rdi, -0xb0(%rbp)
00000000000489c1	jmp	0x48a07
00000000000489c3	jmp	0x489c5
00000000000489c5	movq	%rax, %rbx
00000000000489c8	movq	-0xa0(%rbp), %rdi
00000000000489cf	testq	%rdi, %rdi
00000000000489d2	je	0x489e0
00000000000489d4	movq	%rdi, -0x98(%rbp)
00000000000489db	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000489e0	movq	-0x80(%rbp), %rdi
00000000000489e4	testq	%rdi, %rdi
00000000000489e7	je	0x48a30
00000000000489e9	movq	%rdi, -0x78(%rbp)
00000000000489ed	jmp	0x48a2b
00000000000489ef	jmp	0x489f1
00000000000489f1	movq	%rax, %rbx
00000000000489f4	movq	-0xd0(%rbp), %rdi
00000000000489fb	testq	%rdi, %rdi
00000000000489fe	je	0x48a0c
0000000000048a00	movq	%rdi, -0xc8(%rbp)
0000000000048a07	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048a0c	movq	-0x80(%rbp), %rdi
0000000000048a10	testq	%rdi, %rdi
0000000000048a13	je	0x48a1e
0000000000048a15	movq	%rdi, -0x78(%rbp)
0000000000048a19	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048a1e	movq	-0x60(%rbp), %rdi
0000000000048a22	testq	%rdi, %rdi
0000000000048a25	je	0x48a30
0000000000048a27	movq	%rdi, -0x58(%rbp)
0000000000048a2b	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000048a30	movq	%rbx, %rdi
0000000000048a33	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
