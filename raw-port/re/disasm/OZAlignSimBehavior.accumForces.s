__ZN18OZAlignSimBehavior11accumForcesEP15OZSimStateArray:
00000000003f12b0	pushq	%rbp
00000000003f12b1	movq	%rsp, %rbp
00000000003f12b4	pushq	%r15
00000000003f12b6	pushq	%r14
00000000003f12b8	pushq	%r12
00000000003f12ba	pushq	%rbx
00000000003f12bb	subq	$0x240, %rsp                    ## imm = 0x240
00000000003f12c2	movq	%rsi, %rbx
00000000003f12c5	movq	%rdi, %r14
00000000003f12c8	movq	0x28(%rsi), %rax
00000000003f12cc	movq	%rax, -0xb0(%rbp)
00000000003f12d3	movups	0x18(%rsi), %xmm0
00000000003f12d7	movaps	%xmm0, -0xc0(%rbp)
00000000003f12de	movq	(%rdi), %rax
00000000003f12e1	movq	0x28(%rsi), %rcx
00000000003f12e5	movq	%rcx, 0x10(%rsp)
00000000003f12ea	movdqu	0x18(%rsi), %xmm0
00000000003f12ef	movdqu	%xmm0, (%rsp)
00000000003f12f4	xorl	%esi, %esi
00000000003f12f6	movl	$0x1, %edx
00000000003f12fb	movl	$0x1, %ecx
00000000003f1300	callq	*0x128(%rax)
00000000003f1306	testb	%al, %al
00000000003f1308	je	0x3f1d86
00000000003f130e	movq	-0xb0(%rbp), %rax
00000000003f1315	movq	%rax, -0x190(%rbp)
00000000003f131c	movapd	-0xc0(%rbp), %xmm0
00000000003f1324	movapd	%xmm0, -0x1a0(%rbp)
00000000003f132c	leaq	0x1f0(%r14), %rdi
00000000003f1333	leaq	-0x1a0(%rbp), %rsi
00000000003f133a	xorpd	%xmm0, %xmm0
00000000003f133e	movapd	%xmm0, -0x140(%rbp)
00000000003f1346	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f134b	xorpd	%xmm0, %xmm0
00000000003f134f	movapd	%xmm0, -0x130(%rbp)
00000000003f1357	xorpd	%xmm0, %xmm0
00000000003f135b	movapd	%xmm0, -0xa0(%rbp)
00000000003f1363	movapd	%xmm0, -0x90(%rbp)
00000000003f136b	movsd	%xmm0, -0x58(%rbp)
00000000003f1370	xorpd	%xmm5, %xmm5
00000000003f1374	pxor	%xmm2, %xmm2
00000000003f1378	xorpd	%xmm0, %xmm0
00000000003f137c	movapd	%xmm0, -0x160(%rbp)
00000000003f1384	movapd	%xmm0, -0x150(%rbp)
00000000003f138c	movapd	%xmm0, -0x1c0(%rbp)
00000000003f1394	cmpl	$0x2, %eax
00000000003f1397	ja	0x3f1424
00000000003f139d	movl	%eax, %eax
00000000003f139f	leaq	0x31b8ca(%rip), %rcx
00000000003f13a6	movsd	(%rcx,%rax,8), %xmm0
00000000003f13ab	leaq	0x31b8d6(%rip), %rcx
00000000003f13b2	leaq	0x31b8e7(%rip), %rdx
00000000003f13b9	movsd	(%rdx,%rax,8), %xmm1
00000000003f13be	leaq	0x31b8f3(%rip), %rdx
00000000003f13c5	movsd	(%rdx,%rax,8), %xmm2
00000000003f13ca	movsd	%xmm2, -0x58(%rbp)
00000000003f13cf	leaq	0x31b8fa(%rip), %rdx
00000000003f13d6	movsd	(%rdx,%rax,8), %xmm5
00000000003f13db	leaq	0x31b906(%rip), %rdx
00000000003f13e2	movq	(%rdx,%rax,8), %xmm2
00000000003f13e7	movsd	(%rcx,%rax,8), %xmm4
00000000003f13ec	movapd	%xmm1, %xmm3
00000000003f13f0	unpcklpd	%xmm4, %xmm3                    ## xmm3 = xmm3[0],xmm4[0]
00000000003f13f4	movapd	%xmm3, -0x160(%rbp)
00000000003f13fc	unpcklpd	%xmm0, %xmm4                    ## xmm4 = xmm4[0],xmm0[0]
00000000003f1400	movapd	%xmm4, -0x150(%rbp)
00000000003f1408	movapd	%xmm0, -0xa0(%rbp)
00000000003f1410	movapd	%xmm1, -0x90(%rbp)
00000000003f1418	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000003f141c	movapd	%xmm0, -0x1c0(%rbp)
00000000003f1424	movapd	%xmm5, -0x180(%rbp)
00000000003f142c	movdqa	%xmm2, -0x170(%rbp)
00000000003f1434	movq	-0xb0(%rbp), %rax
00000000003f143b	movq	%rax, -0x190(%rbp)
00000000003f1442	movdqa	-0xc0(%rbp), %xmm0
00000000003f144a	movdqa	%xmm0, -0x1a0(%rbp)
00000000003f1452	leaq	0x2f0(%r14), %rdi
00000000003f1459	leaq	-0x1a0(%rbp), %rsi
00000000003f1460	pxor	%xmm0, %xmm0
00000000003f1464	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f1469	cmpl	$0x2, %eax
00000000003f146c	je	0x3f1508
00000000003f1472	cmpl	$0x1, %eax
00000000003f1475	jne	0x3f1593
00000000003f147b	movsd	0x3162a5(%rip), %xmm0
00000000003f1483	xorpd	%xmm1, %xmm1
00000000003f1487	movapd	%xmm1, -0x80(%rbp)
00000000003f148c	movapd	%xmm0, -0x140(%rbp)
00000000003f1494	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000003f1498	movapd	%xmm1, -0x130(%rbp)
00000000003f14a0	movsd	0x313f38(%rip), %xmm1
00000000003f14a8	xorpd	%xmm0, %xmm0
00000000003f14ac	movapd	%xmm1, -0x50(%rbp)
00000000003f14b1	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000003f14b5	movapd	%xmm0, -0x70(%rbp)
00000000003f14ba	movsd	0x316266(%rip), %xmm0
00000000003f14c2	movaps	%xmm0, -0x100(%rbp)
00000000003f14c9	movq	0x313f0f(%rip), %xmm0
00000000003f14d1	xorpd	%xmm1, %xmm1
00000000003f14d5	movapd	%xmm1, -0x120(%rbp)
00000000003f14dd	movapd	%xmm1, -0x40(%rbp)
00000000003f14e2	movapd	%xmm1, -0x110(%rbp)
00000000003f14ea	xorpd	%xmm1, %xmm1
00000000003f14ee	movapd	%xmm1, -0xf0(%rbp)
00000000003f14f6	movdqa	%xmm0, -0xe0(%rbp)
00000000003f14fe	movdqa	%xmm0, -0x30(%rbp)
00000000003f1503	jmp	0x3f15f4
00000000003f1508	movq	0x313ed0(%rip), %xmm1
00000000003f1510	pxor	%xmm0, %xmm0
00000000003f1514	movdqa	%xmm0, -0x70(%rbp)
00000000003f1519	pxor	%xmm2, %xmm2
00000000003f151d	movdqa	%xmm1, -0x110(%rbp)
00000000003f1525	punpcklqdq	%xmm1, %xmm2            ## xmm2 = xmm2[0],xmm1[0]
00000000003f1529	movq	0x3161f7(%rip), %xmm1
00000000003f1531	movdqa	%xmm1, -0x40(%rbp)
00000000003f1536	punpcklqdq	%xmm1, %xmm0            ## xmm0 = xmm0[0],xmm1[0]
00000000003f153a	movdqa	%xmm0, -0x30(%rbp)
00000000003f153f	movsd	0x313e99(%rip), %xmm1
00000000003f1547	pxor	%xmm0, %xmm0
00000000003f154b	movdqa	%xmm0, -0x120(%rbp)
00000000003f1553	movdqa	%xmm0, -0x140(%rbp)
00000000003f155b	movdqa	%xmm0, -0x50(%rbp)
00000000003f1560	movapd	%xmm1, -0x80(%rbp)
00000000003f1565	movapd	%xmm1, -0xf0(%rbp)
00000000003f156d	pxor	%xmm0, %xmm0
00000000003f1571	movdqa	%xmm0, -0x130(%rbp)
00000000003f1579	movdqa	%xmm2, -0xe0(%rbp)
00000000003f1581	movdqa	%xmm2, -0x100(%rbp)
00000000003f1589	movdqa	%xmm2, -0xd0(%rbp)
00000000003f1591	jmp	0x3f15fc
00000000003f1593	movq	0x313e45(%rip), %xmm2
00000000003f159b	pxor	%xmm0, %xmm0
00000000003f159f	punpcklqdq	%xmm2, %xmm0            ## xmm0 = xmm0[0],xmm2[0]
00000000003f15a3	movsd	0x313e35(%rip), %xmm1
00000000003f15ab	movdqa	%xmm2, -0x120(%rbp)
00000000003f15b3	movdqa	%xmm2, -0x50(%rbp)
00000000003f15b8	pxor	%xmm2, %xmm2
00000000003f15bc	movdqa	%xmm2, -0x40(%rbp)
00000000003f15c1	movdqa	%xmm2, -0x110(%rbp)
00000000003f15c9	movapd	%xmm1, -0x70(%rbp)
00000000003f15ce	movapd	%xmm1, -0x30(%rbp)
00000000003f15d3	movapd	%xmm1, -0xf0(%rbp)
00000000003f15db	movdqa	%xmm0, -0x100(%rbp)
00000000003f15e3	xorpd	%xmm1, %xmm1
00000000003f15e7	movapd	%xmm1, -0xe0(%rbp)
00000000003f15ef	movdqa	%xmm0, -0x80(%rbp)
00000000003f15f4	movdqa	%xmm0, -0xd0(%rbp)
00000000003f15fc	leaq	0x3f0(%r14), %rdi
00000000003f1603	leaq	-0xc0(%rbp), %r12
00000000003f160a	pxor	%xmm0, %xmm0
00000000003f160e	movq	%r12, %rsi
00000000003f1611	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f1616	movl	%eax, %r15d
00000000003f1619	leaq	0x488(%r14), %rdi
00000000003f1620	pxor	%xmm0, %xmm0
00000000003f1624	movq	%r12, %rsi
00000000003f1627	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000003f162c	movq	%xmm0, -0x1b0(%rbp)
00000000003f1634	addq	$0x520, %r14                    ## imm = 0x520
00000000003f163b	pxor	%xmm0, %xmm0
00000000003f163f	movq	%r14, %rdi
00000000003f1642	movq	%r12, %rsi
00000000003f1645	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000003f164a	movq	%xmm0, -0x1a8(%rbp)
00000000003f1652	movq	(%rbx), %r14
00000000003f1655	movq	0x8(%rbx), %rbx
00000000003f1659	cmpq	%rbx, %r14
00000000003f165c	movapd	-0x170(%rbp), %xmm4
00000000003f1664	je	0x3f1d86
00000000003f166a	xorl	%eax, %eax
00000000003f166c	testl	%r15d, %r15d
00000000003f166f	sete	%al
00000000003f1672	movapd	-0x90(%rbp), %xmm0
00000000003f167a	mulsd	-0x40(%rbp), %xmm0
00000000003f167f	movapd	%xmm0, -0x90(%rbp)
00000000003f1687	movapd	-0x160(%rbp), %xmm1
00000000003f168f	movapd	%xmm1, %xmm5
00000000003f1693	movapd	-0x30(%rbp), %xmm3
00000000003f1698	mulpd	%xmm3, %xmm5
00000000003f169c	movapd	-0x150(%rbp), %xmm2
00000000003f16a4	mulpd	%xmm2, %xmm3
00000000003f16a8	movapd	-0xa0(%rbp), %xmm0
00000000003f16b0	mulsd	-0x50(%rbp), %xmm0
00000000003f16b5	movapd	%xmm0, -0xa0(%rbp)
00000000003f16bd	movd	%eax, %xmm0
00000000003f16c1	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
00000000003f16c6	unpcklpd	-0x180(%rbp), %xmm4             ## xmm4 = xmm4[0],mem[0]
00000000003f16ce	xorpd	%xmm6, %xmm6
00000000003f16d2	movapd	%xmm5, %xmm7
00000000003f16d6	unpckhpd	%xmm6, %xmm7                    ## xmm7 = xmm7[1],xmm6[1]
00000000003f16da	movapd	%xmm7, -0x220(%rbp)
00000000003f16e2	shufpd	$0x1, %xmm1, %xmm2              ## xmm2 = xmm2[1],xmm1[0]
00000000003f16e7	movapd	%xmm2, -0x210(%rbp)
00000000003f16ef	xorpd	%xmm1, %xmm1
00000000003f16f3	movapd	%xmm5, -0x240(%rbp)
00000000003f16fb	unpcklpd	%xmm5, %xmm1                    ## xmm1 = xmm1[0],xmm5[0]
00000000003f16ff	movapd	%xmm1, -0x200(%rbp)
00000000003f1707	movapd	-0x70(%rbp), %xmm1
00000000003f170c	shufpd	$0x1, -0x80(%rbp), %xmm1        ## xmm1 = xmm1[1],mem[0]
00000000003f1712	movapd	%xmm1, -0x1f0(%rbp)
00000000003f171a	movapd	%xmm3, %xmm1
00000000003f171e	unpckhpd	%xmm6, %xmm1                    ## xmm1 = xmm1[1],xmm6[1]
00000000003f1722	movapd	%xmm1, -0x1e0(%rbp)
00000000003f172a	xorpd	%xmm1, %xmm1
00000000003f172e	movapd	%xmm3, -0x30(%rbp)
00000000003f1733	unpcklpd	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
00000000003f1737	movapd	%xmm1, -0x1d0(%rbp)
00000000003f173f	movapd	0x3156c8(%rip), %xmm15
00000000003f1748	movsd	0x315780(%rip), %xmm5
00000000003f1750	movapd	0x315e08(%rip), %xmm6
00000000003f1758	psllq	$0x3f, %xmm0
00000000003f175d	movdqa	%xmm0, -0x230(%rbp)
00000000003f1765	movapd	%xmm4, -0x170(%rbp)
00000000003f176d	jmp	0x3f19c2
00000000003f1772	nopw	%cs:(%rax,%rax)
00000000003f1780	movapd	%xmm5, %xmm1
00000000003f1784	mulsd	%xmm9, %xmm1
00000000003f1789	movapd	%xmm9, %xmm6
00000000003f178e	unpckhpd	%xmm9, %xmm6                    ## xmm6 = xmm6[1],xmm9[1]
00000000003f1793	movapd	%xmm4, %xmm7
00000000003f1797	unpckhpd	%xmm4, %xmm7                    ## xmm7 = xmm7[1],xmm4[1]
00000000003f179b	mulsd	%xmm6, %xmm7
00000000003f179f	movapd	%xmm3, %xmm6
00000000003f17a3	mulsd	%xmm0, %xmm6
00000000003f17a7	addsd	%xmm7, %xmm6
00000000003f17ab	movapd	%xmm0, %xmm7
00000000003f17af	unpckhpd	%xmm0, %xmm7                    ## xmm7 = xmm7[1],xmm0[1]
00000000003f17b3	movapd	%xmm3, %xmm8
00000000003f17b8	unpckhpd	%xmm3, %xmm8                    ## xmm8 = xmm8[1],xmm3[1]
00000000003f17bd	mulsd	%xmm7, %xmm8
00000000003f17c2	addsd	%xmm6, %xmm8
00000000003f17c7	subsd	%xmm8, %xmm1
00000000003f17cc	movapd	%xmm4, %xmm6
00000000003f17d0	unpckhpd	%xmm3, %xmm6                    ## xmm6 = xmm6[1],xmm3[1]
00000000003f17d4	movapd	%xmm0, %xmm7
00000000003f17d8	unpcklpd	%xmm9, %xmm7                    ## xmm7 = xmm7[0],xmm9[0]
00000000003f17dd	mulpd	%xmm6, %xmm7
00000000003f17e1	movapd	%xmm3, %xmm6
00000000003f17e5	unpcklpd	%xmm5, %xmm6                    ## xmm6 = xmm6[0],xmm5[0]
00000000003f17e9	movapd	%xmm9, %xmm8
00000000003f17ee	unpckhpd	%xmm0, %xmm8                    ## xmm8 = xmm8[1],xmm0[1]
00000000003f17f3	mulpd	%xmm6, %xmm8
00000000003f17f8	movapd	%xmm7, %xmm6
00000000003f17fc	addpd	%xmm8, %xmm6
00000000003f1801	subsd	%xmm8, %xmm7
00000000003f1806	unpckhpd	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
00000000003f180a	addsd	%xmm7, %xmm6
00000000003f180e	movapd	%xmm6, %xmm7
00000000003f1812	movddup	%xmm5, %xmm5                    ## xmm5 = xmm5[0,0]
00000000003f1816	movapd	%xmm9, %xmm6
00000000003f181b	shufpd	$0x1, %xmm0, %xmm6              ## xmm6 = xmm6[1],xmm0[0]
00000000003f1820	mulpd	%xmm5, %xmm6
00000000003f1824	movddup	%xmm9, %xmm5                    ## xmm5 = xmm9[0,0]
00000000003f1829	mulpd	%xmm5, %xmm2
00000000003f182d	addpd	%xmm6, %xmm2
00000000003f1831	movhlps	%xmm0, %xmm9                    ## xmm9 = xmm0[1],xmm9[1]
00000000003f1835	mulpd	%xmm3, %xmm9
00000000003f183a	mulpd	%xmm0, %xmm4
00000000003f183e	subpd	%xmm4, %xmm9
00000000003f1843	addpd	%xmm2, %xmm9
00000000003f1848	movapd	%xmm9, %xmm0
00000000003f184d	mulpd	%xmm9, %xmm0
00000000003f1852	movapd	%xmm0, %xmm2
00000000003f1856	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000003f185a	addsd	%xmm0, %xmm2
00000000003f185e	movapd	%xmm7, %xmm0
00000000003f1862	mulsd	%xmm7, %xmm0
00000000003f1866	addsd	%xmm2, %xmm0
00000000003f186a	xorps	%xmm2, %xmm2
00000000003f186d	sqrtsd	%xmm0, %xmm2
00000000003f1871	movapd	%xmm2, %xmm0
00000000003f1875	andpd	%xmm15, %xmm0
00000000003f187a	cmpltsd	0x315eb5(%rip), %xmm0
00000000003f1883	blendvpd	%xmm0, 0x315554(%rip), %xmm2
00000000003f188c	movapd	%xmm9, %xmm0
00000000003f1891	divsd	%xmm2, %xmm0
00000000003f1895	movapd	%xmm0, -0x180(%rbp)
00000000003f189d	unpckhpd	%xmm9, %xmm9                    ## xmm9 = xmm9[1,1]
00000000003f18a2	divsd	%xmm2, %xmm9
00000000003f18a7	movapd	%xmm9, -0x40(%rbp)
00000000003f18ad	divsd	%xmm2, %xmm7
00000000003f18b1	movapd	%xmm7, -0x50(%rbp)
00000000003f18b6	movapd	%xmm1, %xmm0
00000000003f18ba	callq	0x6dfd44                        ## symbol stub for: _acos
00000000003f18bf	movapd	0x315548(%rip), %xmm15
00000000003f18c8	movapd	%xmm0, %xmm1
00000000003f18cc	addsd	%xmm0, %xmm1
00000000003f18d0	movapd	%xmm1, %xmm2
00000000003f18d4	addsd	0x31b0ec(%rip), %xmm2
00000000003f18dc	movsd	0x3174dc(%rip), %xmm0
00000000003f18e4	cmpltsd	%xmm1, %xmm0
00000000003f18e9	blendvpd	%xmm0, %xmm2, %xmm1
00000000003f18ee	movapd	%xmm1, %xmm2
00000000003f18f2	addsd	0x315e56(%rip), %xmm2
00000000003f18fa	movapd	%xmm1, %xmm0
00000000003f18fe	cmpltsd	0x3174e9(%rip), %xmm0
00000000003f1907	blendvpd	%xmm0, %xmm2, %xmm1
00000000003f190c	mulsd	-0x1b0(%rbp), %xmm1
00000000003f1914	movapd	-0x180(%rbp), %xmm3
00000000003f191c	mulsd	%xmm1, %xmm3
00000000003f1920	movapd	-0x40(%rbp), %xmm4
00000000003f1925	mulsd	%xmm1, %xmm4
00000000003f1929	mulsd	-0x50(%rbp), %xmm1
00000000003f192e	movsd	0x50(%r14), %xmm0
00000000003f1934	movsd	-0x1a8(%rbp), %xmm2
00000000003f193c	mulsd	%xmm2, %xmm0
00000000003f1940	subsd	%xmm0, %xmm3
00000000003f1944	movsd	0x58(%r14), %xmm0
00000000003f194a	mulsd	%xmm2, %xmm0
00000000003f194e	subsd	%xmm0, %xmm4
00000000003f1952	movsd	0x60(%r14), %xmm0
00000000003f1958	mulsd	%xmm2, %xmm0
00000000003f195c	addsd	0x98(%r14), %xmm3
00000000003f1965	subsd	%xmm0, %xmm1
00000000003f1969	movsd	%xmm3, 0x98(%r14)
00000000003f1972	movapd	%xmm4, %xmm0
00000000003f1976	addsd	0xa0(%r14), %xmm0
00000000003f197f	movsd	%xmm0, 0xa0(%r14)
00000000003f1988	addsd	0xa8(%r14), %xmm1
00000000003f1991	movsd	%xmm1, 0xa8(%r14)
00000000003f199a	movapd	-0x170(%rbp), %xmm4
00000000003f19a2	movsd	0x315526(%rip), %xmm5
00000000003f19aa	movapd	0x315bae(%rip), %xmm6
00000000003f19b2	addq	$0xf8, %r14
00000000003f19b9	cmpq	%rbx, %r14
00000000003f19bc	je	0x3f1d86
00000000003f19c2	movupd	0x38(%r14), %xmm1
00000000003f19c8	mulpd	%xmm4, %xmm1
00000000003f19cc	movsd	0x48(%r14), %xmm3
00000000003f19d2	mulsd	-0x58(%rbp), %xmm3
00000000003f19d7	movapd	%xmm1, %xmm0
00000000003f19db	mulpd	%xmm1, %xmm0
00000000003f19df	movapd	%xmm0, %xmm2
00000000003f19e3	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
00000000003f19e7	addsd	%xmm0, %xmm2
00000000003f19eb	movapd	%xmm3, %xmm0
00000000003f19ef	mulsd	%xmm3, %xmm0
00000000003f19f3	addsd	%xmm2, %xmm0
00000000003f19f7	movapd	%xmm0, %xmm2
00000000003f19fb	andpd	%xmm15, %xmm2
00000000003f1a00	ucomisd	%xmm2, %xmm5
00000000003f1a04	ja	0x3f19b2
00000000003f1a06	sqrtsd	%xmm0, %xmm0
00000000003f1a0a	movapd	%xmm0, %xmm2
00000000003f1a0e	andpd	%xmm15, %xmm2
00000000003f1a13	xorl	%eax, %eax
00000000003f1a15	movsd	0x315d1b(%rip), %xmm4
00000000003f1a1d	ucomisd	%xmm2, %xmm4
00000000003f1a21	setbe	%cl
00000000003f1a24	ja	0x3f1a2a
00000000003f1a26	divsd	%xmm0, %xmm3
00000000003f1a2a	movapd	%xmm3, %xmm2
00000000003f1a2e	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000003f1a32	movapd	%xmm1, %xmm4
00000000003f1a36	divpd	%xmm0, %xmm4
00000000003f1a3a	movb	%cl, %al
00000000003f1a3c	movd	%eax, %xmm0
00000000003f1a40	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
00000000003f1a45	psllq	$0x3f, %xmm0
00000000003f1a4a	blendvpd	%xmm0, %xmm4, %xmm1
00000000003f1a4f	xorpd	%xmm6, %xmm2
00000000003f1a53	movapd	%xmm1, %xmm5
00000000003f1a57	xorpd	%xmm6, %xmm5
00000000003f1a5b	movapd	%xmm1, %xmm4
00000000003f1a5f	shufpd	$0x1, %xmm3, %xmm4              ## xmm4 = xmm4[1],xmm3[0]
00000000003f1a64	movapd	%xmm2, %xmm9
00000000003f1a69	palignr	$0x8, %xmm5, %xmm9              ## xmm9 = xmm5[8,9,10,11,12,13,14,15],xmm9[0,1,2,3,4,5,6,7]
00000000003f1a70	movaps	-0x230(%rbp), %xmm0
00000000003f1a77	blendvpd	%xmm0, %xmm4, %xmm9
00000000003f1a7d	mulpd	-0x1c0(%rbp), %xmm9
00000000003f1a86	unpcklpd	%xmm5, %xmm2                    ## xmm2 = xmm2[0],xmm5[0]
00000000003f1a8a	blendvpd	%xmm0, %xmm1, %xmm5
00000000003f1a8f	unpcklpd	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0]
00000000003f1a93	blendvpd	%xmm0, %xmm3, %xmm2
00000000003f1a98	movapd	%xmm5, %xmm8
00000000003f1a9d	shufpd	$0x1, %xmm2, %xmm8              ## xmm8 = xmm8[1],xmm2[0]
00000000003f1aa3	movapd	-0x160(%rbp), %xmm3
00000000003f1aab	movapd	%xmm3, %xmm6
00000000003f1aaf	mulpd	%xmm8, %xmm6
00000000003f1ab4	movapd	-0x150(%rbp), %xmm1
00000000003f1abc	movapd	%xmm1, %xmm7
00000000003f1ac0	mulpd	%xmm2, %xmm7
00000000003f1ac4	subpd	%xmm9, %xmm7
00000000003f1ac9	movapd	-0x210(%rbp), %xmm0
00000000003f1ad1	mulpd	%xmm5, %xmm0
00000000003f1ad5	mulpd	%xmm5, %xmm1
00000000003f1ad9	subpd	%xmm1, %xmm6
00000000003f1add	movapd	%xmm3, %xmm1
00000000003f1ae1	mulpd	%xmm2, %xmm1
00000000003f1ae5	subpd	%xmm1, %xmm0
00000000003f1ae9	movapd	-0x120(%rbp), %xmm1
00000000003f1af1	mulsd	%xmm5, %xmm1
00000000003f1af5	movapd	-0x140(%rbp), %xmm3
00000000003f1afd	mulsd	%xmm7, %xmm3
00000000003f1b01	addsd	%xmm1, %xmm3
00000000003f1b05	movapd	-0x70(%rbp), %xmm13
00000000003f1b0b	movapd	%xmm13, %xmm4
00000000003f1b10	mulpd	%xmm8, %xmm4
00000000003f1b15	movapd	-0x130(%rbp), %xmm11
00000000003f1b1e	movapd	%xmm11, %xmm9
00000000003f1b23	mulpd	%xmm7, %xmm9
00000000003f1b28	movapd	-0x80(%rbp), %xmm12
00000000003f1b2e	movapd	%xmm12, %xmm1
00000000003f1b33	mulpd	%xmm5, %xmm1
00000000003f1b37	addpd	%xmm9, %xmm1
00000000003f1b3c	movapd	-0x1f0(%rbp), %xmm9
00000000003f1b45	mulpd	%xmm2, %xmm9
00000000003f1b4a	movapd	-0x100(%rbp), %xmm14
00000000003f1b53	mulpd	%xmm14, %xmm0
00000000003f1b58	addpd	%xmm4, %xmm0
00000000003f1b5c	addpd	-0x220(%rbp), %xmm0
00000000003f1b64	movapd	-0xf0(%rbp), %xmm10
00000000003f1b6d	movapd	%xmm10, %xmm4
00000000003f1b72	mulpd	%xmm6, %xmm4
00000000003f1b76	addpd	%xmm9, %xmm4
00000000003f1b7b	movapd	-0xe0(%rbp), %xmm9
00000000003f1b84	mulpd	%xmm5, %xmm9
00000000003f1b89	mulpd	%xmm7, %xmm10
00000000003f1b8e	addpd	%xmm9, %xmm10
00000000003f1b93	addpd	-0x1d0(%rbp), %xmm10
00000000003f1b9c	subpd	%xmm10, %xmm0
00000000003f1ba1	movapd	%xmm13, %xmm9
00000000003f1ba6	mulpd	%xmm2, %xmm9
00000000003f1bab	movapd	%xmm14, %xmm10
00000000003f1bb0	mulpd	%xmm6, %xmm10
00000000003f1bb5	addpd	%xmm9, %xmm10
00000000003f1bba	addpd	-0x240(%rbp), %xmm1
00000000003f1bc2	addpd	-0x1e0(%rbp), %xmm10
00000000003f1bcb	subpd	%xmm10, %xmm1
00000000003f1bd0	addsd	-0x90(%rbp), %xmm3
00000000003f1bd8	addpd	-0x200(%rbp), %xmm4
00000000003f1be0	unpckhpd	%xmm7, %xmm5                    ## xmm5 = xmm5[1],xmm7[1]
00000000003f1be4	mulpd	-0xd0(%rbp), %xmm5
00000000003f1bec	mulpd	%xmm12, %xmm8
00000000003f1bf1	shufpd	$0x1, %xmm6, %xmm7              ## xmm7 = xmm7[1],xmm6[0]
00000000003f1bf6	mulpd	%xmm11, %xmm7
00000000003f1bfb	addpd	%xmm8, %xmm7
00000000003f1c00	addpd	-0x30(%rbp), %xmm7
00000000003f1c05	subpd	%xmm7, %xmm4
00000000003f1c09	mulsd	-0x110(%rbp), %xmm2
00000000003f1c11	xorpd	%xmm8, %xmm8
00000000003f1c16	mulsd	%xmm8, %xmm6
00000000003f1c1b	movapd	%xmm5, %xmm7
00000000003f1c1f	unpckhpd	%xmm5, %xmm7                    ## xmm7 = xmm7[1],xmm5[1]
00000000003f1c23	addpd	%xmm5, %xmm7
00000000003f1c27	unpcklpd	%xmm6, %xmm7                    ## xmm7 = xmm7[0],xmm6[0]
00000000003f1c2b	xorpd	%xmm6, %xmm6
00000000003f1c2f	unpcklpd	%xmm2, %xmm6                    ## xmm6 = xmm6[0],xmm2[0]
00000000003f1c33	addpd	%xmm7, %xmm6
00000000003f1c37	movsd	0x3137a1(%rip), %xmm5
00000000003f1c3f	movapd	%xmm5, %xmm2
00000000003f1c43	subsd	%xmm3, %xmm2
00000000003f1c47	addsd	%xmm5, %xmm3
00000000003f1c4b	movapd	%xmm6, %xmm5
00000000003f1c4f	addsd	%xmm3, %xmm5
00000000003f1c53	movapd	%xmm2, %xmm7
00000000003f1c57	unpcklpd	-0xa0(%rbp), %xmm7              ## xmm7 = xmm7[0],mem[0]
00000000003f1c5f	addpd	%xmm6, %xmm7
00000000003f1c63	subsd	%xmm6, %xmm3
00000000003f1c67	unpcklpd	%xmm7, %xmm3                    ## xmm3 = xmm3[0],xmm7[0]
00000000003f1c6b	subsd	%xmm6, %xmm2
00000000003f1c6f	movapd	%xmm7, %xmm6
00000000003f1c73	shufpd	$0x1, %xmm2, %xmm6              ## xmm6 = xmm6[1],xmm2[0]
00000000003f1c78	movapd	%xmm7, %xmm2
00000000003f1c7c	addpd	%xmm7, %xmm6
00000000003f1c80	unpckhpd	%xmm7, %xmm7                    ## xmm7 = xmm7[1,1]
00000000003f1c84	addsd	%xmm7, %xmm5
00000000003f1c88	subpd	%xmm7, %xmm3
00000000003f1c8c	subpd	%xmm7, %xmm2
00000000003f1c90	blendpd	$0x2, %xmm6, %xmm2              ## xmm2 = xmm2[0],xmm6[1]
00000000003f1c96	shufpd	$0x1, %xmm3, %xmm6              ## xmm6 = xmm6[1],xmm3[0]
00000000003f1c9b	xorpd	%xmm7, %xmm7
00000000003f1c9f	maxpd	%xmm7, %xmm3
00000000003f1ca3	maxpd	%xmm7, %xmm2
00000000003f1ca7	maxpd	%xmm7, %xmm6
00000000003f1cab	sqrtpd	%xmm3, %xmm3
00000000003f1caf	sqrtpd	%xmm2, %xmm7
00000000003f1cb3	sqrtpd	%xmm6, %xmm6
00000000003f1cb7	movapd	0x313741(%rip), %xmm2
00000000003f1cbf	mulpd	%xmm2, %xmm3
00000000003f1cc3	mulpd	%xmm2, %xmm7
00000000003f1cc7	mulpd	%xmm2, %xmm6
00000000003f1ccb	andpd	%xmm15, %xmm3
00000000003f1cd0	movapd	%xmm15, %xmm2
00000000003f1cd5	andnpd	%xmm4, %xmm2
00000000003f1cd9	orpd	%xmm3, %xmm2
00000000003f1cdd	andpd	%xmm15, %xmm7
00000000003f1ce2	movapd	%xmm15, %xmm3
00000000003f1ce7	andnpd	%xmm1, %xmm3
00000000003f1ceb	orpd	%xmm7, %xmm3
00000000003f1cef	andpd	%xmm15, %xmm6
00000000003f1cf4	movapd	%xmm15, %xmm4
00000000003f1cf9	andnpd	%xmm0, %xmm4
00000000003f1cfd	orpd	%xmm6, %xmm4
00000000003f1d01	movupd	0x18(%r14), %xmm9
00000000003f1d07	movupd	0x28(%r14), %xmm0
00000000003f1d0d	movapd	%xmm0, %xmm1
00000000003f1d11	mulpd	%xmm0, %xmm1
00000000003f1d15	movapd	%xmm9, %xmm6
00000000003f1d1a	mulpd	%xmm9, %xmm6
00000000003f1d1f	movapd	%xmm6, %xmm7
00000000003f1d23	unpckhpd	%xmm6, %xmm7                    ## xmm7 = xmm7[1],xmm6[1]
00000000003f1d27	addpd	%xmm1, %xmm7
00000000003f1d2b	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000003f1d2f	addpd	%xmm7, %xmm1
00000000003f1d33	addpd	%xmm6, %xmm1
00000000003f1d37	maxsd	%xmm8, %xmm5
00000000003f1d3c	sqrtsd	%xmm5, %xmm5
00000000003f1d40	mulsd	0x315160(%rip), %xmm5
00000000003f1d48	ucomisd	%xmm8, %xmm1
00000000003f1d4d	jne	0x3f1d55
00000000003f1d4f	jnp	0x3f1780
00000000003f1d55	movapd	%xmm9, %xmm6
00000000003f1d5a	unpckhpd	%xmm9, %xmm6                    ## xmm6 = xmm6[1],xmm9[1]
00000000003f1d5f	movapd	0x3157f9(%rip), %xmm7
00000000003f1d67	xorpd	%xmm7, %xmm6
00000000003f1d6b	xorpd	%xmm7, %xmm0
00000000003f1d6f	unpcklpd	%xmm6, %xmm9                    ## xmm9 = xmm9[0],xmm6[0]
00000000003f1d74	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000003f1d78	divpd	%xmm1, %xmm0
00000000003f1d7c	divpd	%xmm1, %xmm9
00000000003f1d81	jmp	0x3f1780
00000000003f1d86	addq	$0x240, %rsp                    ## imm = 0x240
00000000003f1d8d	popq	%rbx
00000000003f1d8e	popq	%r12
00000000003f1d90	popq	%r14
00000000003f1d92	popq	%r15
00000000003f1d94	popq	%rbp
00000000003f1d95	retq
00000000003f1d96	nopw	%cs:(%rax,%rax)
