__ZN12ImplicitLineC2ERK9PCVector2IdES3_:
   6c6c4:	55	pushq	%rbp
   6c6c5:	48 89 e5	movq	%rsp, %rbp
   6c6c8:	0f 57 c0	xorps	%xmm0, %xmm0
   6c6cb:	0f 11 07	movups	%xmm0, (%rdi)
   6c6ce:	66 0f 10 0a	movupd	(%rdx), %xmm1
   6c6d2:	66 0f 10 06	movupd	(%rsi), %xmm0
   6c6d6:	66 0f 5c c8	subpd	%xmm0, %xmm1
   6c6da:	66 0f 28 c1	movapd	%xmm1, %xmm0
   6c6de:	66 0f 59 c1	mulpd	%xmm1, %xmm0
   6c6e2:	66 0f 7c c0	haddpd	%xmm0, %xmm0
   6c6e6:	f2 0f 51 d8	sqrtsd	%xmm0, %xmm3
   6c6ea:	66 0f 28 05 7e 5f 0b 00	movapd	0xb5f7e(%rip), %xmm0
   6c6f2:	66 0f 54 c3	andpd	%xmm3, %xmm0
   6c6f6:	f2 0f 10 25 62 61 0b 00	movsd	0xb6162(%rip), %xmm4
   6c6fe:	66 0f 2e e0	ucomisd	%xmm0, %xmm4
   6c702:	66 0f 28 e9	movapd	%xmm1, %xmm5
   6c706:	f2 0f 5e eb	divsd	%xmm3, %xmm5
   6c70a:	66 0f 28 d1	movapd	%xmm1, %xmm2
   6c70e:	66 0f 15 d1	unpckhpd	%xmm1, %xmm2
   6c712:	f2 0f c2 c4 05	cmpnltsd	%xmm4, %xmm0
   6c717:	66 0f 38 15 cd	blendvpd	%xmm0, %xmm5, %xmm1
   6c71c:	77 04	ja	0x6c722
   6c71e:	f2 0f 5e d3	divsd	%xmm3, %xmm2
   6c722:	66 0f 28 05 46 59 07 00	movapd	0x75946(%rip), %xmm0
   6c72a:	66 0f 28 da	movapd	%xmm2, %xmm3
   6c72e:	66 0f 57 d8	xorpd	%xmm0, %xmm3
   6c732:	66 0f 14 d9	unpcklpd	%xmm1, %xmm3
   6c736:	66 0f 11 1f	movupd	%xmm3, (%rdi)
   6c73a:	f2 0f 10 5e 08	movsd	0x8(%rsi), %xmm3
   6c73f:	f2 0f 59 16	mulsd	(%rsi), %xmm2
   6c743:	f2 0f 59 d9	mulsd	%xmm1, %xmm3
   6c747:	f2 0f 5c da	subsd	%xmm2, %xmm3
   6c74b:	66 0f 57 d8	xorpd	%xmm0, %xmm3
   6c74f:	66 0f 13 5f 10	movlpd	%xmm3, 0x10(%rdi)
   6c754:	5d	popq	%rbp
   6c755:	c3	retq
