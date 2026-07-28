__ZNK6cc_YIQmlERK9cc_matrix:
00000000000973a0	pushq	%rbp
00000000000973a1	movq	%rsp, %rbp
00000000000973a4	movq	%rdi, %rax
00000000000973a7	movss	0x8(%rsi), %xmm0
00000000000973ac	movsd	(%rsi), %xmm1
00000000000973b0	movups	(%rdx), %xmm2
00000000000973b3	movaps	%xmm1, %xmm3
00000000000973b6	shufps	$0xe1, %xmm1, %xmm3             ## xmm3 = xmm3[1,0],xmm1[2,3]
00000000000973ba	movaps	%xmm2, %xmm4
00000000000973bd	shufps	$0xed, %xmm2, %xmm4             ## xmm4 = xmm4[1,3],xmm2[2,3]
00000000000973c1	mulps	%xmm3, %xmm4
00000000000973c4	movsd	0x10(%rdx), %xmm3
00000000000973c9	insertps	$0x1c, %xmm3, %xmm2             ## xmm2 = xmm2[0],xmm3[0],zero,zero
00000000000973cf	mulps	%xmm1, %xmm2
00000000000973d2	addps	%xmm4, %xmm2
00000000000973d5	movsldup	%xmm0, %xmm4                    ## xmm4 = xmm0[0,0,2,2]
00000000000973d9	movsd	0x8(%rdx), %xmm5
00000000000973de	insertps	$0x50, %xmm3, %xmm5             ## xmm5 = xmm5[0],xmm3[1],xmm5[2,3]
00000000000973e4	mulps	%xmm4, %xmm5
00000000000973e7	addps	%xmm2, %xmm5
00000000000973ea	movlps	%xmm5, (%rdi)
00000000000973ed	movss	0x18(%rdx), %xmm2
00000000000973f2	mulss	%xmm1, %xmm2
00000000000973f6	movshdup	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1,3,3]
00000000000973fa	mulss	0x1c(%rdx), %xmm1
00000000000973ff	mulss	0x20(%rdx), %xmm0
0000000000097404	addss	%xmm2, %xmm1
0000000000097408	addss	%xmm1, %xmm0
000000000009740c	movss	%xmm0, 0x8(%rdi)
0000000000097411	popq	%rbp
0000000000097412	retq
