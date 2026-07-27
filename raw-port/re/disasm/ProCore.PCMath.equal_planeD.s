__ZN6PCMath5equalERK7PCPlaneIdES3_d:
000000000006716a	pushq	%rbp
000000000006716b	movq	%rsp, %rbp
000000000006716e	movapd	%xmm0, %xmm1
0000000000067172	movupd	0x18(%rdi), %xmm3
0000000000067177	movsd	0x28(%rdi), %xmm2
000000000006717c	movsd	0x28(%rsi), %xmm4
0000000000067181	movupd	0x18(%rsi), %xmm6
0000000000067186	movsd	0x20(%rsi), %xmm5
000000000006718b	movapd	%xmm3, %xmm0
000000000006718f	unpcklpd	%xmm6, %xmm0                    ## xmm0 = xmm0[0],xmm6[0]
0000000000067193	mulpd	%xmm0, %xmm0
0000000000067197	movapd	%xmm3, %xmm7
000000000006719b	unpckhpd	%xmm6, %xmm7                    ## xmm7 = xmm7[1],xmm6[1]
000000000006719f	mulpd	%xmm7, %xmm7
00000000000671a3	addpd	%xmm0, %xmm7
00000000000671a7	movapd	%xmm2, %xmm0
00000000000671ab	unpcklpd	%xmm4, %xmm0                    ## xmm0 = xmm0[0],xmm4[0]
00000000000671af	mulpd	%xmm0, %xmm0
00000000000671b3	addpd	%xmm7, %xmm0
00000000000671b7	movapd	%xmm0, %xmm7
00000000000671bb	unpckhpd	%xmm0, %xmm7                    ## xmm7 = xmm7[1],xmm0[1]
00000000000671bf	divsd	%xmm7, %xmm0
00000000000671c3	movapd	%xmm6, %xmm8
00000000000671c8	unpcklpd	%xmm5, %xmm8                    ## xmm8 = xmm8[0],xmm5[0]
00000000000671cd	mulpd	%xmm3, %xmm8
00000000000671d2	haddpd	%xmm8, %xmm8
00000000000671d7	xorps	%xmm7, %xmm7
00000000000671da	sqrtsd	%xmm0, %xmm7
00000000000671de	movapd	%xmm2, %xmm0
00000000000671e2	mulsd	%xmm4, %xmm0
00000000000671e6	addsd	%xmm8, %xmm0
00000000000671eb	movapd	0x7ae7c(%rip), %xmm8
00000000000671f4	xorpd	%xmm7, %xmm8
00000000000671f9	xorpd	%xmm9, %xmm9
00000000000671fe	cmpltsd	%xmm9, %xmm0
0000000000067204	blendvpd	%xmm0, %xmm8, %xmm7
000000000006720a	mulsd	%xmm7, %xmm6
000000000006720e	movapd	%xmm3, %xmm8
0000000000067213	subsd	%xmm6, %xmm8
0000000000067218	andpd	0xbb44f(%rip), %xmm8
0000000000067221	movsd	0xbb657(%rip), %xmm0
0000000000067229	ucomisd	%xmm8, %xmm0
000000000006722e	jbe	0x67268
0000000000067230	mulsd	%xmm7, %xmm5
0000000000067234	movapd	%xmm3, %xmm6
0000000000067238	unpckhpd	%xmm3, %xmm6                    ## xmm6 = xmm6[1],xmm3[1]
000000000006723c	subsd	%xmm5, %xmm6
0000000000067240	andpd	0xbb428(%rip), %xmm6
0000000000067248	ucomisd	%xmm6, %xmm0
000000000006724c	jbe	0x67268
000000000006724e	mulsd	%xmm7, %xmm4
0000000000067252	movapd	%xmm2, %xmm5
0000000000067256	subsd	%xmm4, %xmm5
000000000006725a	andpd	0xbb40e(%rip), %xmm5
0000000000067262	ucomisd	%xmm5, %xmm0
0000000000067266	ja	0x6726c
0000000000067268	xorl	%eax, %eax
000000000006726a	popq	%rbp
000000000006726b	retq
000000000006726c	movupd	(%rdi), %xmm4
0000000000067270	movupd	(%rsi), %xmm5
0000000000067274	movapd	%xmm4, %xmm6
0000000000067278	subsd	%xmm5, %xmm6
000000000006727c	andpd	0xbb3ec(%rip), %xmm6
0000000000067284	ucomisd	%xmm6, %xmm0
0000000000067288	jbe	0x672bc
000000000006728a	movsd	0x8(%rdi), %xmm6
000000000006728f	subsd	0x8(%rsi), %xmm6
0000000000067294	andpd	0xbb3d4(%rip), %xmm6
000000000006729c	ucomisd	%xmm6, %xmm0
00000000000672a0	jbe	0x672bc
00000000000672a2	movsd	0x10(%rdi), %xmm6
00000000000672a7	subsd	0x10(%rsi), %xmm6
00000000000672ac	andpd	0xbb3bc(%rip), %xmm6
00000000000672b4	movb	$0x1, %al
00000000000672b6	ucomisd	%xmm6, %xmm0
00000000000672ba	ja	0x6726a
00000000000672bc	movapd	%xmm5, %xmm0
00000000000672c0	movsd	%xmm4, %xmm0                    ## xmm0 = xmm4[0],xmm0[1]
00000000000672c4	mulpd	%xmm3, %xmm0
00000000000672c8	shufpd	$0x1, %xmm3, %xmm3              ## xmm3 = xmm3[1,0]
00000000000672cd	shufpd	$0x1, %xmm5, %xmm4              ## xmm4 = xmm4[1],xmm5[0]
00000000000672d2	mulpd	%xmm3, %xmm4
00000000000672d6	addpd	%xmm0, %xmm4
00000000000672da	movupd	0x10(%rdi), %xmm0
00000000000672df	movddup	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0]
00000000000672e3	movhpd	0x10(%rsi), %xmm0               ## xmm0 = xmm0[0],mem[0]
00000000000672e8	mulpd	%xmm2, %xmm0
00000000000672ec	addpd	%xmm4, %xmm0
00000000000672f0	hsubpd	%xmm0, %xmm0
00000000000672f4	andpd	0xbb374(%rip), %xmm0
00000000000672fc	ucomisd	%xmm0, %xmm1
0000000000067300	seta	%al
0000000000067303	jmp	0x6726a
