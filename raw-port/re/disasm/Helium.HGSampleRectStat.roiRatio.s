__ZNK16HGSampleRectStat8roiRatioEv:
0000000000148a80	pushq	%rbp
0000000000148a81	movq	%rsp, %rbp
0000000000148a84	movl	0x10(%rdi), %eax
0000000000148a87	movl	0x14(%rdi), %ecx
0000000000148a8a	subl	0x8(%rdi), %eax
0000000000148a8d	subl	0xc(%rdi), %ecx
0000000000148a90	movl	0x20(%rdi), %edx
0000000000148a93	subl	0x18(%rdi), %edx
0000000000148a96	movl	0x24(%rdi), %esi
0000000000148a99	subl	0x1c(%rdi), %esi
0000000000148a9c	cvtsi2ss	%edx, %xmm1
0000000000148aa0	cvtsi2ss	%eax, %xmm2
0000000000148aa4	cvtsi2ss	%esi, %xmm0
0000000000148aa8	cvtsi2ss	%ecx, %xmm3
0000000000148aac	divss	%xmm2, %xmm1
0000000000148ab0	mulss	%xmm1, %xmm0
0000000000148ab4	divss	%xmm3, %xmm0
0000000000148ab8	popq	%rbp
0000000000148ab9	retq
0000000000148aba	nopw	(%rax,%rax)
