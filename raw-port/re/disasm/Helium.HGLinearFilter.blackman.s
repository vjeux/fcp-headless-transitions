__ZN14HGLinearFilter8blackmanEfff:
000000000010f720	movaps	%xmm0, %xmm1
000000000010f723	movaps	0x2b8506(%rip), %xmm2
000000000010f72a	andps	%xmm0, %xmm2
000000000010f72d	xorps	%xmm0, %xmm0
000000000010f730	movss	0x2b8588(%rip), %xmm3
000000000010f738	ucomiss	%xmm2, %xmm3
000000000010f73b	jbe	0x10f789
000000000010f73d	pushq	%rbp
000000000010f73e	movq	%rsp, %rbp
000000000010f741	xorps	%xmm0, %xmm0
000000000010f744	cvtss2sd	%xmm1, %xmm0
000000000010f748	mulsd	0x2c2ca8(%rip), %xmm0
000000000010f750	callq	0x3c5072                        ## symbol stub for: _cos
000000000010f755	cvtsd2ss	%xmm0, %xmm0
000000000010f759	movsldup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0,2,2]
000000000010f75d	addss	%xmm0, %xmm0
000000000010f761	movaps	0x2c2bf8(%rip), %xmm2
000000000010f768	insertps	$0x10, %xmm0, %xmm2             ## xmm2 = xmm2[0],xmm0[0],xmm2[2,3]
000000000010f76e	mulps	%xmm1, %xmm2
000000000010f771	addps	0x2c2bf8(%rip), %xmm2
000000000010f778	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
000000000010f77c	mulss	0x2c2c70(%rip), %xmm0
000000000010f784	addss	%xmm2, %xmm0
000000000010f788	popq	%rbp
000000000010f789	retq
000000000010f78a	nopw	(%rax,%rax)
