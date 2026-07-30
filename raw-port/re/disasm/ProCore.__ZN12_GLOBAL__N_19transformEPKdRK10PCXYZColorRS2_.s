__ZN12_GLOBAL__N_19transformEPKdRK10PCXYZColorRS2_:
00000000000af6fa	pushq	%rbp
00000000000af6fb	movq	%rsp, %rbp
00000000000af6fe	movsd	0x10(%rsi), %xmm1
00000000000af703	movsd	0x40(%rdi), %xmm0
00000000000af708	mulsd	%xmm1, %xmm0
00000000000af70c	movupd	(%rsi), %xmm2
00000000000af710	movupd	(%rdi), %xmm3
00000000000af714	movupd	0x10(%rdi), %xmm4
00000000000af719	movupd	0x20(%rdi), %xmm5
00000000000af71e	movapd	%xmm2, %xmm6
00000000000af722	shufpd	$0x1, %xmm2, %xmm6              ## xmm6 = xmm6[1],xmm2[0]
00000000000af727	movapd	%xmm3, %xmm7
00000000000af72b	unpckhpd	%xmm4, %xmm7                    ## xmm7 = xmm7[1],xmm4[1]
00000000000af72f	mulpd	%xmm6, %xmm7
00000000000af733	unpcklpd	%xmm5, %xmm3                    ## xmm3 = xmm3[0],xmm5[0]
00000000000af737	mulpd	%xmm2, %xmm3
00000000000af73b	addpd	%xmm7, %xmm3
00000000000af73f	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000000af743	movsd	%xmm4, %xmm5                    ## xmm5 = xmm4[0],xmm5[1]
00000000000af747	mulpd	%xmm1, %xmm5
00000000000af74b	mulsd	0x30(%rdi), %xmm2
00000000000af750	addpd	%xmm3, %xmm5
00000000000af754	movsd	0x8(%rsi), %xmm1
00000000000af759	mulsd	0x38(%rdi), %xmm1
00000000000af75e	addsd	%xmm2, %xmm1
00000000000af762	addsd	%xmm0, %xmm1
00000000000af766	movsd	%xmm1, 0x10(%rdx)
00000000000af76b	movupd	%xmm5, (%rdx)
00000000000af76f	popq	%rbp
00000000000af770	retq
