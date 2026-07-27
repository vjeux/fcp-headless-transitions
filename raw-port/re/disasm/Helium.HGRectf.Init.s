__ZN7HGRectf4InitEffff:
0000000000107220	pushq	%rbp
0000000000107221	movq	%rsp, %rbp
0000000000107224	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000010722a	insertps	$0x10, %xmm3, %xmm2             ## xmm2 = xmm2[0],xmm3[0],xmm2[2,3]
0000000000107230	movaps	%xmm2, %xmm1
0000000000107233	minps	%xmm0, %xmm1
0000000000107236	movaps	%xmm2, %xmm3
0000000000107239	maxps	%xmm0, %xmm3
000000000010723c	cmpunordps	%xmm0, %xmm0
0000000000107240	blendvps	%xmm0, %xmm2, %xmm1
0000000000107245	blendvps	%xmm0, %xmm2, %xmm3
000000000010724a	movlhps	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
000000000010724d	movups	%xmm1, (%rdi)
0000000000107250	popq	%rbp
0000000000107251	retq
0000000000107252	nopw	%cs:(%rax,%rax)
