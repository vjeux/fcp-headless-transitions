_HGRectFloat:
0000000000107930	pushq	%rbp
0000000000107931	movq	%rsp, %rbp
0000000000107934	cvtsi2ss	%edi, %xmm0
0000000000107938	shrq	$0x20, %rdi
000000000010793c	cvtsi2ss	%esi, %xmm1
0000000000107940	cvtsi2ss	%edi, %xmm2
0000000000107944	shrq	$0x20, %rsi
0000000000107948	cvtsi2ss	%esi, %xmm3
000000000010794c	insertps	$0x10, %xmm2, %xmm0             ## xmm0 = xmm0[0],xmm2[0],xmm0[2,3]
0000000000107952	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
0000000000107958	popq	%rbp
0000000000107959	retq
000000000010795a	nopw	(%rax,%rax)
