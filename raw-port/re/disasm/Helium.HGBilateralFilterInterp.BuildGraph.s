__ZN23HGBilateralFilterInterp10BuildGraphEv:
0000000000109280	pushq	%rbp
0000000000109281	movq	%rsp, %rbp
0000000000109284	pushq	%r15
0000000000109286	pushq	%r14
0000000000109288	pushq	%r13
000000000010928a	pushq	%r12
000000000010928c	pushq	%rbx
000000000010928d	pushq	%rax
000000000010928e	movq	%rdi, %rbx
0000000000109291	callq	__ZN23HGBilateralFilterInterp12DestroyGraphEv ## HGBilateralFilterInterp::DestroyGraph()
0000000000109296	movl	$0x18, %edi
000000000010929b	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001092a0	movq	%rax, %r14
00000000001092a3	movl	0x1c8(%rbx), %r13d
00000000001092aa	movq	%r13, -0x30(%rbp)
00000000001092ae	xorps	%xmm0, %xmm0
00000000001092b1	movups	%xmm0, (%rax)
00000000001092b4	movq	$0x0, 0x10(%rax)
00000000001092bc	incl	%r13d
00000000001092bf	je	0x1092f1
00000000001092c1	leaq	(,%r13,8), %r15
00000000001092c9	movq	%r15, %rdi
00000000001092cc	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001092d1	movq	%rax, (%r14)
00000000001092d4	leaq	(%rax,%r13,8), %rcx
00000000001092d8	movq	%rcx, 0x10(%r14)
00000000001092dc	movq	%rax, %r12
00000000001092df	addq	%r15, %r12
00000000001092e2	movq	%rax, %rdi
00000000001092e5	movq	%r15, %rsi
00000000001092e8	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001092ed	movq	%r12, 0x8(%r14)
00000000001092f1	movq	%r14, 0x198(%rbx)
00000000001092f8	movl	$0x18, %edi
00000000001092fd	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000109302	movq	%rax, %r14
0000000000109305	xorps	%xmm0, %xmm0
0000000000109308	movups	%xmm0, (%rax)
000000000010930b	movq	$0x0, 0x10(%rax)
0000000000109313	testq	%r13, %r13
0000000000109316	je	0x109348
0000000000109318	leaq	(,%r13,8), %r15
0000000000109320	movq	%r15, %rdi
0000000000109323	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000109328	movq	%rax, (%r14)
000000000010932b	leaq	(%rax,%r13,8), %rcx
000000000010932f	movq	%rcx, 0x10(%r14)
0000000000109333	movq	%rax, %r12
0000000000109336	addq	%r15, %r12
0000000000109339	movq	%rax, %rdi
000000000010933c	movq	%r15, %rsi
000000000010933f	callq	0x3c4fca                        ## symbol stub for: ___bzero
0000000000109344	movq	%r12, 0x8(%r14)
0000000000109348	movq	%r14, 0x1a0(%rbx)
000000000010934f	movl	$0x18, %edi
0000000000109354	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000109359	movq	%rax, %r14
000000000010935c	xorps	%xmm0, %xmm0
000000000010935f	movups	%xmm0, (%rax)
0000000000109362	movq	$0x0, 0x10(%rax)
000000000010936a	testq	%r13, %r13
000000000010936d	je	0x10939f
000000000010936f	leaq	(,%r13,8), %r15
0000000000109377	movq	%r15, %rdi
000000000010937a	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000010937f	movq	%rax, (%r14)
0000000000109382	leaq	(%rax,%r13,8), %rcx
0000000000109386	movq	%rcx, 0x10(%r14)
000000000010938a	movq	%rax, %r12
000000000010938d	addq	%r15, %r12
0000000000109390	movq	%rax, %rdi
0000000000109393	movq	%r15, %rsi
0000000000109396	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000010939b	movq	%r12, 0x8(%r14)
000000000010939f	movq	%r14, 0x1a8(%rbx)
00000000001093a6	movl	$0x18, %edi
00000000001093ab	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001093b0	movq	%rax, %r14
00000000001093b3	xorps	%xmm0, %xmm0
00000000001093b6	movups	%xmm0, (%rax)
00000000001093b9	movq	$0x0, 0x10(%rax)
00000000001093c1	movq	-0x30(%rbp), %r12
00000000001093c5	testq	%r12, %r12
00000000001093c8	je	0x1093fa
00000000001093ca	leaq	(,%r12,8), %r15
00000000001093d2	movq	%r15, %rdi
00000000001093d5	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001093da	movq	%rax, (%r14)
00000000001093dd	leaq	(%rax,%r12,8), %rcx
00000000001093e1	movq	%rcx, 0x10(%r14)
00000000001093e5	movq	%rax, %r12
00000000001093e8	addq	%r15, %r12
00000000001093eb	movq	%rax, %rdi
00000000001093ee	movq	%r15, %rsi
00000000001093f1	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001093f6	movq	%r12, 0x8(%r14)
00000000001093fa	movq	%r14, 0x1b0(%rbx)
0000000000109401	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109406	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010940b	movq	%rax, %r14
000000000010940e	movq	%rax, %rdi
0000000000109411	callq	__ZN40HgcBilateralFilterInterp_IntensityWeightC1Ev ## HgcBilateralFilterInterp_IntensityWeight::HgcBilateralFilterInterp_IntensityWeight()
0000000000109416	movq	0x198(%rbx), %rcx
000000000010941d	movq	(%rcx), %rax
0000000000109420	cmpq	%rax, 0x8(%rcx)
0000000000109424	je	0x109b47
000000000010942a	movq	%r14, (%rax)
000000000010942d	movq	0x1b8(%rbx), %rdx
0000000000109434	movq	(%r14), %rax
0000000000109437	movq	%r14, %rdi
000000000010943a	xorl	%esi, %esi
000000000010943c	callq	*0x78(%rax)
000000000010943f	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109444	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109449	movq	%rax, %r14
000000000010944c	movq	%rax, %rdi
000000000010944f	callq	__ZN33HgcBilateralFilterInterp_MultiplyC1Ev ## HgcBilateralFilterInterp_Multiply::HgcBilateralFilterInterp_Multiply()
0000000000109454	movq	0x198(%rbx), %rcx
000000000010945b	movq	(%rcx), %rax
000000000010945e	cmpq	%rax, 0x8(%rcx)
0000000000109462	je	0x109b47
0000000000109468	movq	(%rax), %rdx
000000000010946b	movq	(%r14), %rax
000000000010946e	movq	%r14, %rdi
0000000000109471	xorl	%esi, %esi
0000000000109473	callq	*0x78(%rax)
0000000000109476	movq	0x1b8(%rbx), %rdx
000000000010947d	movq	(%r14), %rax
0000000000109480	movq	%r14, %rdi
0000000000109483	movl	$0x1, %esi
0000000000109488	callq	*0x78(%rax)
000000000010948b	movl	$0x220, %edi                    ## imm = 0x220
0000000000109490	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109495	movq	%rax, %r15
0000000000109498	movq	%rax, %rdi
000000000010949b	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001094a0	movq	0x1a8(%rbx), %rcx
00000000001094a7	movq	(%rcx), %rax
00000000001094aa	cmpq	%rax, 0x8(%rcx)
00000000001094ae	je	0x109b47
00000000001094b4	movq	%r15, (%rax)
00000000001094b7	movq	(%r15), %rax
00000000001094ba	movq	%r15, %rdi
00000000001094bd	xorl	%esi, %esi
00000000001094bf	movq	%r14, %rdx
00000000001094c2	callq	*0x78(%rax)
00000000001094c5	movq	(%r14), %rax
00000000001094c8	movq	%r14, %rdi
00000000001094cb	callq	*0x18(%rax)
00000000001094ce	movl	$0x220, %edi                    ## imm = 0x220
00000000001094d3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001094d8	movq	%rax, %r14
00000000001094db	movq	%rax, %rdi
00000000001094de	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001094e3	movq	0x1a0(%rbx), %rcx
00000000001094ea	movq	(%rcx), %rax
00000000001094ed	cmpq	%rax, 0x8(%rcx)
00000000001094f1	je	0x109b47
00000000001094f7	movq	%r14, (%rax)
00000000001094fa	movq	0x198(%rbx), %rcx
0000000000109501	movq	(%rcx), %rax
0000000000109504	cmpq	%rax, 0x8(%rcx)
0000000000109508	je	0x109b47
000000000010950e	movq	(%rax), %rdx
0000000000109511	movq	(%r14), %rax
0000000000109514	movq	%r14, %rdi
0000000000109517	xorl	%esi, %esi
0000000000109519	callq	*0x78(%rax)
000000000010951c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109521	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109526	movq	%rax, %r14
0000000000109529	movq	%rax, %rdi
000000000010952c	callq	__ZN31HgcBilateralFilterInterp_DivideC1Ev ## HgcBilateralFilterInterp_Divide::HgcBilateralFilterInterp_Divide()
0000000000109531	movq	0x1a8(%rbx), %rcx
0000000000109538	movq	(%rcx), %rax
000000000010953b	cmpq	%rax, 0x8(%rcx)
000000000010953f	je	0x109b47
0000000000109545	movq	(%rax), %rdx
0000000000109548	movq	(%r14), %rax
000000000010954b	movq	%r14, %rdi
000000000010954e	xorl	%esi, %esi
0000000000109550	callq	*0x78(%rax)
0000000000109553	movq	0x1a0(%rbx), %rcx
000000000010955a	movq	(%rcx), %rax
000000000010955d	cmpq	%rax, 0x8(%rcx)
0000000000109561	je	0x109b47
0000000000109567	movq	(%rax), %rdx
000000000010956a	movq	(%r14), %rax
000000000010956d	movq	%r14, %rdi
0000000000109570	movl	$0x1, %esi
0000000000109575	callq	*0x78(%rax)
0000000000109578	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000010957d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109582	movq	%rax, %r15
0000000000109585	movq	%rax, %rdi
0000000000109588	callq	__ZN42HgcBilateralFilterInterp_InterpolatorFirstC1Ev ## HgcBilateralFilterInterp_InterpolatorFirst::HgcBilateralFilterInterp_InterpolatorFirst()
000000000010958d	movq	0x1b0(%rbx), %rcx
0000000000109594	movq	(%rcx), %rax
0000000000109597	cmpq	%rax, 0x8(%rcx)
000000000010959b	je	0x109b47
00000000001095a1	movq	%r15, (%rax)
00000000001095a4	movq	0x1b8(%rbx), %rdx
00000000001095ab	movq	(%r15), %rax
00000000001095ae	movq	%r15, %rdi
00000000001095b1	xorl	%esi, %esi
00000000001095b3	callq	*0x78(%rax)
00000000001095b6	movq	0x1b0(%rbx), %rcx
00000000001095bd	movq	(%rcx), %rax
00000000001095c0	cmpq	%rax, 0x8(%rcx)
00000000001095c4	je	0x109b47
00000000001095ca	movq	(%rax), %rdi
00000000001095cd	movq	(%rdi), %rax
00000000001095d0	movl	$0x1, %esi
00000000001095d5	movq	%r14, %rdx
00000000001095d8	callq	*0x78(%rax)
00000000001095db	movq	(%r14), %rax
00000000001095de	movq	%r14, %rdi
00000000001095e1	callq	*0x18(%rax)
00000000001095e4	cmpl	$0x2, 0x1c8(%rbx)
00000000001095eb	jb	0x1098e6
00000000001095f1	movl	$0x1, %r12d
00000000001095f7	nopw	(%rax,%rax)
0000000000109600	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109605	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010960a	movq	%rax, %r14
000000000010960d	movq	%rax, %rdi
0000000000109610	callq	__ZN40HgcBilateralFilterInterp_IntensityWeightC1Ev ## HgcBilateralFilterInterp_IntensityWeight::HgcBilateralFilterInterp_IntensityWeight()
0000000000109615	movq	0x198(%rbx), %rcx
000000000010961c	movq	(%rcx), %rax
000000000010961f	movq	0x8(%rcx), %rcx
0000000000109623	subq	%rax, %rcx
0000000000109626	sarq	$0x3, %rcx
000000000010962a	cmpq	%r12, %rcx
000000000010962d	jbe	0x109b47
0000000000109633	movq	%r14, (%rax,%r12,8)
0000000000109637	movq	0x1b8(%rbx), %rdx
000000000010963e	movq	(%r14), %rax
0000000000109641	movq	%r14, %rdi
0000000000109644	xorl	%esi, %esi
0000000000109646	callq	*0x78(%rax)
0000000000109649	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000010964e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109653	movq	%rax, %r14
0000000000109656	movq	%rax, %rdi
0000000000109659	callq	__ZN33HgcBilateralFilterInterp_MultiplyC1Ev ## HgcBilateralFilterInterp_Multiply::HgcBilateralFilterInterp_Multiply()
000000000010965e	movq	0x198(%rbx), %rcx
0000000000109665	movq	(%rcx), %rax
0000000000109668	movq	0x8(%rcx), %rcx
000000000010966c	subq	%rax, %rcx
000000000010966f	sarq	$0x3, %rcx
0000000000109673	cmpq	%r12, %rcx
0000000000109676	jbe	0x109b47
000000000010967c	movq	(%rax,%r12,8), %rdx
0000000000109680	movq	(%r14), %rax
0000000000109683	movq	%r14, %rdi
0000000000109686	xorl	%esi, %esi
0000000000109688	callq	*0x78(%rax)
000000000010968b	movq	0x1b8(%rbx), %rdx
0000000000109692	movq	(%r14), %rax
0000000000109695	movq	%r14, %rdi
0000000000109698	movl	$0x1, %esi
000000000010969d	callq	*0x78(%rax)
00000000001096a0	movl	$0x220, %edi                    ## imm = 0x220
00000000001096a5	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001096aa	movq	%rax, %r15
00000000001096ad	movq	%rax, %rdi
00000000001096b0	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001096b5	movq	0x1a8(%rbx), %rcx
00000000001096bc	movq	(%rcx), %rax
00000000001096bf	movq	0x8(%rcx), %rcx
00000000001096c3	subq	%rax, %rcx
00000000001096c6	sarq	$0x3, %rcx
00000000001096ca	cmpq	%r12, %rcx
00000000001096cd	jbe	0x109b47
00000000001096d3	movq	%r15, (%rax,%r12,8)
00000000001096d7	movq	(%r15), %rax
00000000001096da	movq	%r15, %rdi
00000000001096dd	xorl	%esi, %esi
00000000001096df	movq	%r14, %rdx
00000000001096e2	callq	*0x78(%rax)
00000000001096e5	movq	(%r14), %rax
00000000001096e8	movq	%r14, %rdi
00000000001096eb	callq	*0x18(%rax)
00000000001096ee	movl	$0x220, %edi                    ## imm = 0x220
00000000001096f3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001096f8	movq	%rax, %r14
00000000001096fb	movq	%rax, %rdi
00000000001096fe	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
0000000000109703	movq	0x1a0(%rbx), %rcx
000000000010970a	movq	(%rcx), %rax
000000000010970d	movq	0x8(%rcx), %rcx
0000000000109711	subq	%rax, %rcx
0000000000109714	sarq	$0x3, %rcx
0000000000109718	cmpq	%r12, %rcx
000000000010971b	jbe	0x109b47
0000000000109721	movq	%r14, (%rax,%r12,8)
0000000000109725	movq	0x198(%rbx), %rcx
000000000010972c	movq	(%rcx), %rax
000000000010972f	movq	0x8(%rcx), %rcx
0000000000109733	subq	%rax, %rcx
0000000000109736	sarq	$0x3, %rcx
000000000010973a	cmpq	%r12, %rcx
000000000010973d	jbe	0x109b47
0000000000109743	movq	(%rax,%r12,8), %rdx
0000000000109747	movq	(%r14), %rax
000000000010974a	movq	%r14, %rdi
000000000010974d	xorl	%esi, %esi
000000000010974f	callq	*0x78(%rax)
0000000000109752	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109757	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010975c	movq	%rax, %r14
000000000010975f	movq	%rax, %rdi
0000000000109762	callq	__ZN31HgcBilateralFilterInterp_DivideC1Ev ## HgcBilateralFilterInterp_Divide::HgcBilateralFilterInterp_Divide()
0000000000109767	movq	0x1a8(%rbx), %rcx
000000000010976e	movq	(%rcx), %rax
0000000000109771	movq	0x8(%rcx), %rcx
0000000000109775	subq	%rax, %rcx
0000000000109778	sarq	$0x3, %rcx
000000000010977c	cmpq	%r12, %rcx
000000000010977f	jbe	0x109b47
0000000000109785	movq	(%rax,%r12,8), %rdx
0000000000109789	movq	(%r14), %rax
000000000010978c	movq	%r14, %rdi
000000000010978f	xorl	%esi, %esi
0000000000109791	callq	*0x78(%rax)
0000000000109794	movq	0x1a0(%rbx), %rcx
000000000010979b	movq	(%rcx), %rax
000000000010979e	movq	0x8(%rcx), %rcx
00000000001097a2	subq	%rax, %rcx
00000000001097a5	sarq	$0x3, %rcx
00000000001097a9	cmpq	%r12, %rcx
00000000001097ac	jbe	0x109b47
00000000001097b2	movq	(%rax,%r12,8), %rdx
00000000001097b6	movq	(%r14), %rax
00000000001097b9	movq	%r14, %rdi
00000000001097bc	movl	$0x1, %esi
00000000001097c1	callq	*0x78(%rax)
00000000001097c4	movl	0x1c8(%rbx), %r13d
00000000001097cb	decl	%r13d
00000000001097ce	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001097d3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001097d8	movq	%rax, %r15
00000000001097db	cmpl	%r13d, %r12d
00000000001097de	jae	0x1097f0
00000000001097e0	movq	%r15, %rdi
00000000001097e3	callq	__ZN37HgcBilateralFilterInterp_InterpolatorC1Ev ## HgcBilateralFilterInterp_Interpolator::HgcBilateralFilterInterp_Interpolator()
00000000001097e8	jmp	0x1097f8
00000000001097ea	nopw	(%rax,%rax)
00000000001097f0	movq	%r15, %rdi
00000000001097f3	callq	__ZN41HgcBilateralFilterInterp_InterpolatorLastC1Ev ## HgcBilateralFilterInterp_InterpolatorLast::HgcBilateralFilterInterp_InterpolatorLast()
00000000001097f8	movq	0x1b0(%rbx), %rcx
00000000001097ff	movq	(%rcx), %rax
0000000000109802	movq	0x8(%rcx), %rcx
0000000000109806	subq	%rax, %rcx
0000000000109809	sarq	$0x3, %rcx
000000000010980d	cmpq	%r12, %rcx
0000000000109810	jbe	0x109b47
0000000000109816	movq	%r15, (%rax,%r12,8)
000000000010981a	movq	0x1b8(%rbx), %rdx
0000000000109821	movq	(%r15), %rax
0000000000109824	movq	%r15, %rdi
0000000000109827	xorl	%esi, %esi
0000000000109829	callq	*0x78(%rax)
000000000010982c	movq	0x1b0(%rbx), %rcx
0000000000109833	movq	(%rcx), %rax
0000000000109836	movq	0x8(%rcx), %rcx
000000000010983a	subq	%rax, %rcx
000000000010983d	sarq	$0x3, %rcx
0000000000109841	cmpq	%r12, %rcx
0000000000109844	jbe	0x109b47
000000000010984a	movq	(%rax,%r12,8), %rdi
000000000010984e	movq	(%rdi), %rax
0000000000109851	movl	$0x1, %esi
0000000000109856	movq	%r14, %rdx
0000000000109859	callq	*0x78(%rax)
000000000010985c	movq	0x1b0(%rbx), %rcx
0000000000109863	movq	(%rcx), %rax
0000000000109866	movq	0x8(%rcx), %rcx
000000000010986a	subq	%rax, %rcx
000000000010986d	sarq	$0x3, %rcx
0000000000109871	cmpq	%r12, %rcx
0000000000109874	jbe	0x109b47
000000000010987a	leaq	-0x1(%r12), %r15
000000000010987f	cmpq	%r15, %rcx
0000000000109882	jbe	0x109b47
0000000000109888	movq	-0x8(%rax,%r12,8), %rdx
000000000010988d	movq	(%rax,%r12,8), %rdi
0000000000109891	movq	(%rdi), %rax
0000000000109894	movl	$0x3, %esi
0000000000109899	callq	*0x78(%rax)
000000000010989c	movq	0x1b0(%rbx), %rcx
00000000001098a3	movq	(%rcx), %rax
00000000001098a6	movq	0x8(%rcx), %rcx
00000000001098aa	subq	%rax, %rcx
00000000001098ad	sarq	$0x3, %rcx
00000000001098b1	cmpq	%r15, %rcx
00000000001098b4	jbe	0x109b47
00000000001098ba	movq	-0x8(%rax,%r12,8), %rdi
00000000001098bf	movq	(%rdi), %rax
00000000001098c2	movl	$0x2, %esi
00000000001098c7	movq	%r14, %rdx
00000000001098ca	callq	*0x78(%rax)
00000000001098cd	movq	(%r14), %rax
00000000001098d0	movq	%r14, %rdi
00000000001098d3	callq	*0x18(%rax)
00000000001098d6	incq	%r12
00000000001098d9	cmpl	0x1c8(%rbx), %r12d
00000000001098e0	jb	0x109600
00000000001098e6	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001098eb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001098f0	movq	%rax, %r14
00000000001098f3	movq	%rax, %rdi
00000000001098f6	callq	__ZN40HgcBilateralFilterInterp_IntensityWeightC1Ev ## HgcBilateralFilterInterp_IntensityWeight::HgcBilateralFilterInterp_IntensityWeight()
00000000001098fb	movq	0x198(%rbx), %rdx
0000000000109902	movl	0x1c8(%rbx), %eax
0000000000109908	movq	(%rdx), %rcx
000000000010990b	movq	0x8(%rdx), %rdx
000000000010990f	subq	%rcx, %rdx
0000000000109912	sarq	$0x3, %rdx
0000000000109916	cmpq	%rax, %rdx
0000000000109919	jbe	0x109b47
000000000010991f	movq	%r14, (%rcx,%rax,8)
0000000000109923	movq	0x1b8(%rbx), %rdx
000000000010992a	movq	(%r14), %rax
000000000010992d	movq	%r14, %rdi
0000000000109930	xorl	%esi, %esi
0000000000109932	callq	*0x78(%rax)
0000000000109935	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000010993a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010993f	movq	%rax, %r14
0000000000109942	movq	%rax, %rdi
0000000000109945	callq	__ZN33HgcBilateralFilterInterp_MultiplyC1Ev ## HgcBilateralFilterInterp_Multiply::HgcBilateralFilterInterp_Multiply()
000000000010994a	movq	0x198(%rbx), %rdx
0000000000109951	movl	0x1c8(%rbx), %eax
0000000000109957	movq	(%rdx), %rcx
000000000010995a	movq	0x8(%rdx), %rdx
000000000010995e	subq	%rcx, %rdx
0000000000109961	sarq	$0x3, %rdx
0000000000109965	cmpq	%rax, %rdx
0000000000109968	jbe	0x109b47
000000000010996e	movq	(%rcx,%rax,8), %rdx
0000000000109972	movq	(%r14), %rax
0000000000109975	movq	%r14, %rdi
0000000000109978	xorl	%esi, %esi
000000000010997a	callq	*0x78(%rax)
000000000010997d	movq	0x1b8(%rbx), %rdx
0000000000109984	movq	(%r14), %rax
0000000000109987	movq	%r14, %rdi
000000000010998a	movl	$0x1, %esi
000000000010998f	callq	*0x78(%rax)
0000000000109992	movl	$0x220, %edi                    ## imm = 0x220
0000000000109997	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010999c	movq	%rax, %r15
000000000010999f	movq	%rax, %rdi
00000000001099a2	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001099a7	movq	0x1a8(%rbx), %rdx
00000000001099ae	movl	0x1c8(%rbx), %eax
00000000001099b4	movq	(%rdx), %rcx
00000000001099b7	movq	0x8(%rdx), %rdx
00000000001099bb	subq	%rcx, %rdx
00000000001099be	sarq	$0x3, %rdx
00000000001099c2	cmpq	%rax, %rdx
00000000001099c5	jbe	0x109b47
00000000001099cb	movq	%r15, (%rcx,%rax,8)
00000000001099cf	movq	(%r15), %rax
00000000001099d2	movq	%r15, %rdi
00000000001099d5	xorl	%esi, %esi
00000000001099d7	movq	%r14, %rdx
00000000001099da	callq	*0x78(%rax)
00000000001099dd	movq	(%r14), %rax
00000000001099e0	movq	%r14, %rdi
00000000001099e3	callq	*0x18(%rax)
00000000001099e6	movl	$0x220, %edi                    ## imm = 0x220
00000000001099eb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001099f0	movq	%rax, %r14
00000000001099f3	movq	%rax, %rdi
00000000001099f6	callq	__ZN6HGBlurC1Ev                 ## HGBlur::HGBlur()
00000000001099fb	movq	0x1a0(%rbx), %rdx
0000000000109a02	movl	0x1c8(%rbx), %eax
0000000000109a08	movq	(%rdx), %rcx
0000000000109a0b	movq	0x8(%rdx), %rdx
0000000000109a0f	subq	%rcx, %rdx
0000000000109a12	sarq	$0x3, %rdx
0000000000109a16	cmpq	%rax, %rdx
0000000000109a19	jbe	0x109b47
0000000000109a1f	movq	%r14, (%rcx,%rax,8)
0000000000109a23	movq	0x198(%rbx), %rdx
0000000000109a2a	movq	(%rdx), %rcx
0000000000109a2d	movq	0x8(%rdx), %rdx
0000000000109a31	subq	%rcx, %rdx
0000000000109a34	sarq	$0x3, %rdx
0000000000109a38	cmpq	%rax, %rdx
0000000000109a3b	jbe	0x109b47
0000000000109a41	movq	(%rcx,%rax,8), %rdx
0000000000109a45	movq	(%r14), %rax
0000000000109a48	movq	%r14, %rdi
0000000000109a4b	xorl	%esi, %esi
0000000000109a4d	callq	*0x78(%rax)
0000000000109a50	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000109a55	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000109a5a	movq	%rax, %r14
0000000000109a5d	movq	%rax, %rdi
0000000000109a60	callq	__ZN31HgcBilateralFilterInterp_DivideC1Ev ## HgcBilateralFilterInterp_Divide::HgcBilateralFilterInterp_Divide()
0000000000109a65	movq	0x1a8(%rbx), %rdx
0000000000109a6c	movl	0x1c8(%rbx), %eax
0000000000109a72	movq	(%rdx), %rcx
0000000000109a75	movq	0x8(%rdx), %rdx
0000000000109a79	subq	%rcx, %rdx
0000000000109a7c	sarq	$0x3, %rdx
0000000000109a80	cmpq	%rax, %rdx
0000000000109a83	jbe	0x109b47
0000000000109a89	movq	(%rcx,%rax,8), %rdx
0000000000109a8d	movq	(%r14), %rax
0000000000109a90	movq	%r14, %rdi
0000000000109a93	xorl	%esi, %esi
0000000000109a95	callq	*0x78(%rax)
0000000000109a98	movq	0x1a0(%rbx), %rdx
0000000000109a9f	movl	0x1c8(%rbx), %eax
0000000000109aa5	movq	(%rdx), %rcx
0000000000109aa8	movq	0x8(%rdx), %rdx
0000000000109aac	subq	%rcx, %rdx
0000000000109aaf	sarq	$0x3, %rdx
0000000000109ab3	cmpq	%rax, %rdx
0000000000109ab6	jbe	0x109b47
0000000000109abc	movq	(%rcx,%rax,8), %rdx
0000000000109ac0	movq	(%r14), %rax
0000000000109ac3	movq	%r14, %rdi
0000000000109ac6	movl	$0x1, %esi
0000000000109acb	callq	*0x78(%rax)
0000000000109ace	movq	0x1b0(%rbx), %rdx
0000000000109ad5	movl	0x1c8(%rbx), %eax
0000000000109adb	decl	%eax
0000000000109add	movq	(%rdx), %rcx
0000000000109ae0	movq	0x8(%rdx), %rdx
0000000000109ae4	subq	%rcx, %rdx
0000000000109ae7	sarq	$0x3, %rdx
0000000000109aeb	cmpq	%rax, %rdx
0000000000109aee	jbe	0x109b47
0000000000109af0	movq	(%rcx,%rax,8), %rdi
0000000000109af4	movq	(%rdi), %rax
0000000000109af7	movl	$0x2, %esi
0000000000109afc	movq	%r14, %rdx
0000000000109aff	callq	*0x78(%rax)
0000000000109b02	movq	(%r14), %rax
0000000000109b05	movq	%r14, %rdi
0000000000109b08	callq	*0x18(%rax)
0000000000109b0b	movq	0x1b0(%rbx), %rdx
0000000000109b12	movl	0x1c8(%rbx), %eax
0000000000109b18	decl	%eax
0000000000109b1a	movq	(%rdx), %rcx
0000000000109b1d	movq	0x8(%rdx), %rdx
0000000000109b21	subq	%rcx, %rdx
0000000000109b24	sarq	$0x3, %rdx
0000000000109b28	cmpq	%rax, %rdx
0000000000109b2b	jbe	0x109b47
0000000000109b2d	movq	(%rcx,%rax,8), %rax
0000000000109b31	movq	%rax, 0x1c0(%rbx)
0000000000109b38	addq	$0x8, %rsp
0000000000109b3c	popq	%rbx
0000000000109b3d	popq	%r12
0000000000109b3f	popq	%r13
0000000000109b41	popq	%r14
0000000000109b43	popq	%r15
0000000000109b45	popq	%rbp
0000000000109b46	retq
0000000000109b47	callq	__ZNSt3__16vectorIP6HGNodeNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGNode*, std::__1::allocator<HGNode*>>::__throw_out_of_range[abi:nqe210106]()
0000000000109b4c	jmp	0x109b52
0000000000109b4e	jmp	0x109b52
0000000000109b50	jmp	0x109b52
0000000000109b52	movq	%rax, %rbx
0000000000109b55	movq	%r14, %rdi
0000000000109b58	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000109b5d	movq	%rbx, %rdi
0000000000109b60	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000109b65	jmp	0x109b98
0000000000109b67	jmp	0x109b98
0000000000109b69	jmp	0x109b83
0000000000109b6b	jmp	0x109b98
0000000000109b6d	jmp	0x109b98
0000000000109b6f	jmp	0x109b83
0000000000109b71	jmp	0x109b98
0000000000109b73	jmp	0x109b98
0000000000109b75	jmp	0x109b83
0000000000109b77	jmp	0x109b98
0000000000109b79	jmp	0x109b98
0000000000109b7b	jmp	0x109b83
0000000000109b7d	jmp	0x109b83
0000000000109b7f	jmp	0x109b98
0000000000109b81	jmp	0x109b98
0000000000109b83	movq	%rax, %rbx
0000000000109b86	movq	%r15, %rdi
0000000000109b89	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000109b8e	movq	%rbx, %rdi
0000000000109b91	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000109b96	jmp	0x109b98
0000000000109b98	movq	%rax, %rbx
0000000000109b9b	movq	%r14, %rdi
0000000000109b9e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000109ba3	movq	%rbx, %rdi
0000000000109ba6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000109bab	nopl	(%rax,%rax)
