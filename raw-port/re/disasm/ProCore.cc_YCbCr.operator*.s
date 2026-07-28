__ZNK8cc_YCbCrmlERK9cc_matrix:
00000000000972ae	pushq	%rbp
00000000000972af	movq	%rsp, %rbp
00000000000972b2	movups	(%rsi), %xmm2
00000000000972b5	movsd	(%rdi), %xmm1
00000000000972b9	movsd	0x4(%rdi), %xmm3
00000000000972be	movaps	%xmm1, %xmm0
00000000000972c1	shufps	$0xe1, %xmm1, %xmm0             ## xmm0 = xmm0[1,0],xmm1[2,3]
00000000000972c5	movaps	%xmm2, %xmm4
00000000000972c8	shufps	$0xed, %xmm2, %xmm4             ## xmm4 = xmm4[1,3],xmm2[2,3]
00000000000972cc	mulps	%xmm0, %xmm4
00000000000972cf	movsd	0x10(%rsi), %xmm5
00000000000972d4	insertps	$0x1c, %xmm5, %xmm2             ## xmm2 = xmm2[0],xmm5[0],zero,zero
00000000000972da	mulps	%xmm1, %xmm2
00000000000972dd	addps	%xmm4, %xmm2
00000000000972e0	movss	0x8(%rdi), %xmm0
00000000000972e5	movsldup	%xmm0, %xmm4                    ## xmm4 = xmm0[0,0,2,2]
00000000000972e9	movddup	0x8(%rsi), %xmm0                ## xmm0 = mem[0,0]
00000000000972ee	insertps	$0x50, %xmm5, %xmm0             ## xmm0 = xmm0[0],xmm5[1],xmm0[2,3]
00000000000972f4	mulps	%xmm4, %xmm0
00000000000972f7	addps	%xmm2, %xmm0
00000000000972fa	mulss	0x18(%rsi), %xmm1
00000000000972ff	movsd	0x1c(%rsi), %xmm2
0000000000097304	mulps	%xmm3, %xmm2
0000000000097307	addss	%xmm2, %xmm1
000000000009730b	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
000000000009730f	addss	%xmm1, %xmm2
0000000000097313	movd	%xmm2, %eax
0000000000097317	btsq	$0x21, %rax
000000000009731c	popq	%rbp
000000000009731d	retq
