__ZNK10PTTriangleeqERKS_:
00000000002ffcb0	pushq	%rbp
00000000002ffcb1	movq	%rsp, %rbp
00000000002ffcb4	movsd	(%rsi), %xmm2
00000000002ffcb8	movsd	(%rdi), %xmm0
00000000002ffcbc	movaps	%xmm2, %xmm1
00000000002ffcbf	subps	%xmm0, %xmm1
00000000002ffcc2	andps	0x407ef7(%rip), %xmm1
00000000002ffcc9	cmpltps	0x40886f(%rip), %xmm1
00000000002ffcd1	unpcklps	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0,1,1]
00000000002ffcd4	movmskpd	%xmm1, %eax
00000000002ffcd8	cmpl	$0x3, %eax
00000000002ffcdb	jne	0x2ffd37
00000000002ffcdd	movsd	0x8(%rsi), %xmm3
00000000002ffce2	movsd	0x8(%rdi), %xmm1
00000000002ffce7	movaps	%xmm3, %xmm4
00000000002ffcea	subps	%xmm1, %xmm4
00000000002ffced	andps	0x407ecc(%rip), %xmm4
00000000002ffcf4	cmpltps	0x408844(%rip), %xmm4
00000000002ffcfc	unpcklps	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0,1,1]
00000000002ffcff	movmskpd	%xmm4, %eax
00000000002ffd03	cmpl	$0x3, %eax
00000000002ffd06	jne	0x2ffd3e
00000000002ffd08	movsd	0x10(%rdi), %xmm4
00000000002ffd0d	movsd	0x10(%rsi), %xmm5
00000000002ffd12	subps	%xmm4, %xmm5
00000000002ffd15	andps	0x407ea4(%rip), %xmm5
00000000002ffd1c	cmpltps	0x40881c(%rip), %xmm5
00000000002ffd24	unpcklps	%xmm5, %xmm5                    ## xmm5 = xmm5[0,0,1,1]
00000000002ffd27	movmskpd	%xmm5, %ecx
00000000002ffd2b	movb	$0x1, %al
00000000002ffd2d	cmpl	$0x3, %ecx
00000000002ffd30	jne	0x2ffd43
00000000002ffd32	jmp	0x2ffebd
00000000002ffd37	movsd	0x8(%rdi), %xmm1
00000000002ffd3c	jmp	0x2ffd8a
00000000002ffd3e	movsd	0x10(%rdi), %xmm4
00000000002ffd43	subps	%xmm4, %xmm3
00000000002ffd46	andps	0x407e73(%rip), %xmm3
00000000002ffd4d	cmpltps	0x4087eb(%rip), %xmm3
00000000002ffd55	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffd58	movmskpd	%xmm3, %eax
00000000002ffd5c	cmpl	$0x3, %eax
00000000002ffd5f	jne	0x2ffd8a
00000000002ffd61	movsd	0x10(%rsi), %xmm3
00000000002ffd66	subps	%xmm1, %xmm3
00000000002ffd69	andps	0x407e50(%rip), %xmm3
00000000002ffd70	cmpltps	0x4087c8(%rip), %xmm3
00000000002ffd78	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffd7b	movmskpd	%xmm3, %ecx
00000000002ffd7f	movb	$0x1, %al
00000000002ffd81	cmpl	$0x3, %ecx
00000000002ffd84	je	0x2ffebd
00000000002ffd8a	movaps	%xmm2, %xmm3
00000000002ffd8d	subps	%xmm1, %xmm3
00000000002ffd90	andps	0x407e29(%rip), %xmm3
00000000002ffd97	cmpltps	0x4087a1(%rip), %xmm3
00000000002ffd9f	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffda2	movmskpd	%xmm3, %eax
00000000002ffda6	cmpl	$0x3, %eax
00000000002ffda9	jne	0x2ffe01
00000000002ffdab	movsd	0x8(%rsi), %xmm4
00000000002ffdb0	movaps	%xmm4, %xmm3
00000000002ffdb3	subps	%xmm0, %xmm3
00000000002ffdb6	andps	0x407e03(%rip), %xmm3
00000000002ffdbd	cmpltps	0x40877b(%rip), %xmm3
00000000002ffdc5	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffdc8	movmskpd	%xmm3, %eax
00000000002ffdcc	cmpl	$0x3, %eax
00000000002ffdcf	jne	0x2ffe08
00000000002ffdd1	movsd	0x10(%rdi), %xmm3
00000000002ffdd6	movsd	0x10(%rsi), %xmm5
00000000002ffddb	subps	%xmm3, %xmm5
00000000002ffdde	andps	0x407ddb(%rip), %xmm5
00000000002ffde5	cmpltps	0x408753(%rip), %xmm5
00000000002ffded	unpcklps	%xmm5, %xmm5                    ## xmm5 = xmm5[0,0,1,1]
00000000002ffdf0	movmskpd	%xmm5, %ecx
00000000002ffdf4	movb	$0x1, %al
00000000002ffdf6	cmpl	$0x3, %ecx
00000000002ffdf9	je	0x2ffebd
00000000002ffdff	jmp	0x2ffe0d
00000000002ffe01	movsd	0x10(%rdi), %xmm3
00000000002ffe06	jmp	0x2ffe50
00000000002ffe08	movsd	0x10(%rdi), %xmm3
00000000002ffe0d	subps	%xmm3, %xmm4
00000000002ffe10	andps	0x407da9(%rip), %xmm4
00000000002ffe17	cmpltps	0x408721(%rip), %xmm4
00000000002ffe1f	unpcklps	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0,1,1]
00000000002ffe22	movmskpd	%xmm4, %eax
00000000002ffe26	cmpl	$0x3, %eax
00000000002ffe29	jne	0x2ffe50
00000000002ffe2b	movsd	0x10(%rsi), %xmm4
00000000002ffe30	subps	%xmm0, %xmm4
00000000002ffe33	andps	0x407d86(%rip), %xmm4
00000000002ffe3a	cmpltps	0x4086fe(%rip), %xmm4
00000000002ffe42	unpcklps	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0,1,1]
00000000002ffe45	movmskpd	%xmm4, %ecx
00000000002ffe49	movb	$0x1, %al
00000000002ffe4b	cmpl	$0x3, %ecx
00000000002ffe4e	je	0x2ffebd
00000000002ffe50	subps	%xmm3, %xmm2
00000000002ffe53	andps	0x407d66(%rip), %xmm2
00000000002ffe5a	cmpltps	0x4086de(%rip), %xmm2
00000000002ffe62	unpcklps	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0,1,1]
00000000002ffe65	movmskpd	%xmm2, %eax
00000000002ffe69	cmpl	$0x3, %eax
00000000002ffe6c	jne	0x2fff03
00000000002ffe72	movsd	0x8(%rsi), %xmm2
00000000002ffe77	movaps	%xmm2, %xmm3
00000000002ffe7a	subps	%xmm0, %xmm3
00000000002ffe7d	andps	0x407d3c(%rip), %xmm3
00000000002ffe84	cmpltps	0x4086b4(%rip), %xmm3
00000000002ffe8c	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffe8f	movmskpd	%xmm3, %eax
00000000002ffe93	cmpl	$0x3, %eax
00000000002ffe96	jne	0x2ffebf
00000000002ffe98	movsd	0x10(%rsi), %xmm3
00000000002ffe9d	subps	%xmm1, %xmm3
00000000002ffea0	andps	0x407d19(%rip), %xmm3
00000000002ffea7	cmpltps	0x408691(%rip), %xmm3
00000000002ffeaf	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
00000000002ffeb2	movmskpd	%xmm3, %ecx
00000000002ffeb6	movb	$0x1, %al
00000000002ffeb8	cmpl	$0x3, %ecx
00000000002ffebb	jne	0x2ffebf
00000000002ffebd	popq	%rbp
00000000002ffebe	retq
00000000002ffebf	subps	%xmm1, %xmm2
00000000002ffec2	andps	0x407cf7(%rip), %xmm2
00000000002ffec9	cmpltps	0x40866f(%rip), %xmm2
00000000002ffed1	unpcklps	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0,1,1]
00000000002ffed4	movmskpd	%xmm2, %eax
00000000002ffed8	cmpl	$0x3, %eax
00000000002ffedb	jne	0x2fff03
00000000002ffedd	movsd	0x10(%rsi), %xmm1
00000000002ffee2	subps	%xmm0, %xmm1
00000000002ffee5	andps	0x407cd4(%rip), %xmm1
00000000002ffeec	cmpltps	0x40864c(%rip), %xmm1
00000000002ffef4	unpcklps	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0,1,1]
00000000002ffef7	movmskpd	%xmm1, %eax
00000000002ffefb	cmpl	$0x3, %eax
00000000002ffefe	sete	%al
00000000002fff01	popq	%rbp
00000000002fff02	retq
00000000002fff03	xorl	%eax, %eax
00000000002fff05	popq	%rbp
00000000002fff06	retq
00000000002fff07	nopw	(%rax,%rax)
