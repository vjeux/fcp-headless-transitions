__ZN6PCMath19areCounterClockWiseEffffff:
0000000000012645	pushq	%rbp
0000000000012646	movq	%rsp, %rbp
0000000000012649	insertps	$0x10, %xmm4, %xmm2             ## xmm2 = xmm2[0],xmm4[0],xmm2[2,3]
000000000001264f	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
0000000000012653	subps	%xmm0, %xmm2
0000000000012656	insertps	$0x10, %xmm5, %xmm3             ## xmm3 = xmm3[0],xmm5[0],xmm3[2,3]
000000000001265c	movsldup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0,2,2]
0000000000012660	subps	%xmm0, %xmm3
0000000000012663	movaps	%xmm3, %xmm0
0000000000012666	shufps	$0xe1, %xmm3, %xmm0             ## xmm0 = xmm0[1,0],xmm3[2,3]
000000000001266a	mulps	%xmm2, %xmm0
000000000001266d	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000012671	movb	$0x1, %al
0000000000012673	ucomiss	%xmm1, %xmm0
0000000000012676	ja	0x126ba
0000000000012678	ucomiss	%xmm0, %xmm1
000000000001267b	jbe	0x12681
000000000001267d	xorl	%eax, %eax
000000000001267f	jmp	0x126ba
0000000000012681	ucomiss	%xmm1, %xmm0
0000000000012684	jne	0x126ba
0000000000012686	jp	0x126ba
0000000000012688	movshdup	%xmm2, %xmm1                    ## xmm1 = xmm2[1,1,3,3]
000000000001268c	mulss	%xmm2, %xmm1
0000000000012690	xorl	%eax, %eax
0000000000012692	xorps	%xmm0, %xmm0
0000000000012695	ucomiss	%xmm1, %xmm0
0000000000012698	ja	0x126ba
000000000001269a	movshdup	%xmm3, %xmm1                    ## xmm1 = xmm3[1,1,3,3]
000000000001269e	mulss	%xmm3, %xmm1
00000000000126a2	ucomiss	%xmm1, %xmm0
00000000000126a5	ja	0x126ba
00000000000126a7	mulps	%xmm2, %xmm2
00000000000126aa	mulps	%xmm3, %xmm3
00000000000126ad	addps	%xmm2, %xmm3
00000000000126b0	movshdup	%xmm3, %xmm0                    ## xmm0 = xmm3[1,1,3,3]
00000000000126b4	ucomiss	%xmm0, %xmm3
00000000000126b7	setb	%al
00000000000126ba	popq	%rbp
00000000000126bb	retq
