__ZNK10PTTriangle13containsPointERK9PCVector2IdEd:
0000000000300da0	pushq	%rbp
0000000000300da1	movq	%rsp, %rbp
0000000000300da4	movsd	(%rdi), %xmm1
0000000000300da8	movsd	0x8(%rdi), %xmm4
0000000000300dad	movsd	0x10(%rdi), %xmm2
0000000000300db2	movaps	%xmm2, %xmm5
0000000000300db5	subps	%xmm1, %xmm5
0000000000300db8	movaps	%xmm4, %xmm3
0000000000300dbb	subps	%xmm1, %xmm3
0000000000300dbe	movaps	%xmm5, %xmm6
0000000000300dc1	shufps	$0xe1, %xmm5, %xmm6             ## xmm6 = xmm6[1,0],xmm5[2,3]
0000000000300dc5	movaps	%xmm3, %xmm7
0000000000300dc8	mulps	%xmm6, %xmm7
0000000000300dcb	movshdup	%xmm7, %xmm8                    ## xmm8 = xmm7[1,1,3,3]
0000000000300dd0	subss	%xmm8, %xmm7
0000000000300dd5	andps	0x406de4(%rip), %xmm7
0000000000300ddc	cvtss2sd	%xmm7, %xmm7
0000000000300de0	ucomisd	0x406d70(%rip), %xmm7
0000000000300de8	ja	0x300e4e
0000000000300dea	movaps	%xmm3, %xmm7
0000000000300ded	mulps	%xmm5, %xmm7
0000000000300df0	movshdup	%xmm7, %xmm8                    ## xmm8 = xmm7[1,1,3,3]
0000000000300df5	addps	%xmm7, %xmm8
0000000000300df9	xorps	%xmm7, %xmm7
0000000000300dfc	ucomiss	%xmm8, %xmm7
0000000000300e00	ja	0x300e4e
0000000000300e02	movaps	%xmm5, %xmm9
0000000000300e06	mulps	%xmm5, %xmm9
0000000000300e0a	movshdup	%xmm9, %xmm7                    ## xmm7 = xmm9[1,1,3,3]
0000000000300e0f	addps	%xmm9, %xmm7
0000000000300e13	ucomiss	%xmm7, %xmm8
0000000000300e17	ja	0x300e4e
0000000000300e19	movupd	(%rsi), %xmm8
0000000000300e1e	cvtpd2ps	%xmm8, %xmm8
0000000000300e23	subps	%xmm1, %xmm8
0000000000300e27	mulps	%xmm8, %xmm6
0000000000300e2b	movshdup	%xmm6, %xmm9                    ## xmm9 = xmm6[1,1,3,3]
0000000000300e30	subss	%xmm9, %xmm6
0000000000300e35	andps	0x406d84(%rip), %xmm6
0000000000300e3c	cvtss2sd	%xmm6, %xmm6
0000000000300e40	ucomisd	0x406d10(%rip), %xmm6
0000000000300e48	jbe	0x300fb5
0000000000300e4e	cvtps2pd	%xmm3, %xmm3
0000000000300e51	movaps	%xmm2, %xmm5
0000000000300e54	cvtps2pd	%xmm4, %xmm7
0000000000300e57	subps	%xmm4, %xmm5
0000000000300e5a	cvtps2pd	%xmm5, %xmm6
0000000000300e5d	movapd	%xmm6, %xmm4
0000000000300e61	movupd	(%rsi), %xmm5
0000000000300e65	subpd	%xmm5, %xmm7
0000000000300e69	cvtpd2ps	%xmm7, %xmm7
0000000000300e6d	shufpd	$0x1, %xmm6, %xmm4              ## xmm4 = xmm4[1],xmm6[0]
0000000000300e72	cvtps2pd	%xmm7, %xmm7
0000000000300e75	mulpd	%xmm4, %xmm7
0000000000300e79	mulpd	%xmm3, %xmm4
0000000000300e7d	hsubpd	%xmm4, %xmm7
0000000000300e81	movapd	%xmm7, %xmm4
0000000000300e85	unpckhpd	%xmm7, %xmm4                    ## xmm4 = xmm4[1],xmm7[1]
0000000000300e89	divsd	%xmm4, %xmm7
0000000000300e8d	movapd	0x4066cb(%rip), %xmm4
0000000000300e95	xorpd	%xmm0, %xmm4
0000000000300e99	xorl	%eax, %eax
0000000000300e9b	ucomisd	%xmm4, %xmm7
0000000000300e9f	jb	0x300fb1
0000000000300ea5	addsd	0x404533(%rip), %xmm0
0000000000300ead	ucomisd	%xmm7, %xmm0
0000000000300eb1	jb	0x300fb1
0000000000300eb7	movaps	%xmm1, %xmm7
0000000000300eba	subss	%xmm2, %xmm7
0000000000300ebe	movshdup	%xmm2, %xmm11                   ## xmm11 = xmm2[1,1,3,3]
0000000000300ec3	movshdup	%xmm1, %xmm9                    ## xmm9 = xmm1[1,1,3,3]
0000000000300ec8	movaps	%xmm9, %xmm10
0000000000300ecc	subss	%xmm11, %xmm10
0000000000300ed1	xorps	%xmm8, %xmm8
0000000000300ed5	cvtss2sd	%xmm7, %xmm8
0000000000300eda	xorps	%xmm7, %xmm7
0000000000300edd	cvtss2sd	%xmm10, %xmm7
0000000000300ee2	cvtss2sd	%xmm2, %xmm2
0000000000300ee6	subsd	%xmm5, %xmm2
0000000000300eea	cvtsd2ss	%xmm2, %xmm2
0000000000300eee	xorps	%xmm10, %xmm10
0000000000300ef2	cvtss2sd	%xmm2, %xmm10
0000000000300ef7	cvtss2sd	%xmm11, %xmm11
0000000000300efc	movsd	0x8(%rsi), %xmm2
0000000000300f01	subsd	%xmm2, %xmm11
0000000000300f06	cvtsd2ss	%xmm11, %xmm11
0000000000300f0b	cvtss2sd	%xmm11, %xmm11
0000000000300f10	movddup	%xmm7, %xmm12                   ## xmm12 = xmm7[0,0]
0000000000300f15	movlhps	%xmm6, %xmm10                   ## xmm10 = xmm10[0],xmm6[0]
0000000000300f19	mulpd	%xmm12, %xmm10
0000000000300f1e	movddup	%xmm8, %xmm12                   ## xmm12 = xmm8[0,0]
0000000000300f23	blendps	$0xc, %xmm6, %xmm11             ## xmm11 = xmm11[0,1],xmm6[2,3]
0000000000300f2a	mulpd	%xmm12, %xmm11
0000000000300f2f	subpd	%xmm11, %xmm10
0000000000300f34	movapd	%xmm10, %xmm6
0000000000300f39	unpckhpd	%xmm10, %xmm6                   ## xmm6 = xmm6[1],xmm10[1]
0000000000300f3e	divsd	%xmm6, %xmm10
0000000000300f43	xorl	%eax, %eax
0000000000300f45	ucomisd	%xmm4, %xmm10
0000000000300f4a	jb	0x300fb1
0000000000300f4c	ucomisd	%xmm10, %xmm0
0000000000300f51	jb	0x300fb1
0000000000300f53	cvtss2sd	%xmm1, %xmm1
0000000000300f57	subsd	%xmm5, %xmm1
0000000000300f5b	cvtsd2ss	%xmm1, %xmm1
0000000000300f5f	xorps	%xmm5, %xmm5
0000000000300f62	cvtss2sd	%xmm9, %xmm5
0000000000300f67	subsd	%xmm2, %xmm5
0000000000300f6b	xorps	%xmm2, %xmm2
0000000000300f6e	cvtsd2ss	%xmm5, %xmm2
0000000000300f72	cvtss2sd	%xmm1, %xmm1
0000000000300f76	movapd	%xmm3, %xmm5
0000000000300f7a	unpckhpd	%xmm3, %xmm5                    ## xmm5 = xmm5[1],xmm3[1]
0000000000300f7e	mulsd	%xmm5, %xmm1
0000000000300f82	cvtss2sd	%xmm2, %xmm2
0000000000300f86	mulsd	%xmm3, %xmm2
0000000000300f8a	subsd	%xmm2, %xmm1
0000000000300f8e	mulsd	%xmm8, %xmm5
0000000000300f93	mulsd	%xmm3, %xmm7
0000000000300f97	subsd	%xmm7, %xmm5
0000000000300f9b	divsd	%xmm5, %xmm1
0000000000300f9f	cmplesd	%xmm1, %xmm4
0000000000300fa4	cmplesd	%xmm0, %xmm1
0000000000300fa9	andpd	%xmm4, %xmm1
0000000000300fad	movd	%xmm1, %eax
0000000000300fb1	andb	$0x1, %al
0000000000300fb3	popq	%rbp
0000000000300fb4	retq
0000000000300fb5	mulps	%xmm8, %xmm5
0000000000300fb9	movshdup	%xmm5, %xmm6                    ## xmm6 = xmm5[1,1,3,3]
0000000000300fbd	addss	%xmm5, %xmm6
0000000000300fc1	ucomiss	%xmm7, %xmm6
0000000000300fc4	seta	%cl
0000000000300fc7	xorps	%xmm5, %xmm5
0000000000300fca	ucomiss	%xmm6, %xmm5
0000000000300fcd	ja	0x300e4e
0000000000300fd3	movb	$0x1, %al
0000000000300fd5	testb	%cl, %cl
0000000000300fd7	je	0x300fb1
0000000000300fd9	jmp	0x300e4e
0000000000300fde	nop
