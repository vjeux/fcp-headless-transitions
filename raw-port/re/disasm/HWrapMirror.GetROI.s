__ZN11HWrapMirror6GetROIEP10HGRendereri6HGRect:
0000000000470d00	pushq	%rbp
0000000000470d01	movq	%rsp, %rbp
0000000000470d04	subq	$0x20, %rsp
0000000000470d08	testl	%edx, %edx
0000000000470d0a	jne	0x470dc5
0000000000470d10	movq	%rdi, %rsi
0000000000470d13	xorps	%xmm0, %xmm0
0000000000470d16	movaps	%xmm0, -0x20(%rbp)
0000000000470d1a	movaps	0x29469f(%rip), %xmm0
0000000000470d21	movaps	%xmm0, -0x10(%rbp)
0000000000470d25	addq	$0x240, %rdi                    ## imm = 0x240
0000000000470d2c	addq	$0x1a0, %rsi                    ## imm = 0x1A0
0000000000470d33	leaq	-0x20(%rbp), %rdx
0000000000470d37	callq	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_ ## bool PCMatrix44Tmpl<double>::transformRect<double>(PCRect<double> const&, PCRect<double>&) const
0000000000470d3c	testb	%al, %al
0000000000470d3e	je	0x470dc5
0000000000470d44	movsd	0x29d434(%rip), %xmm0
0000000000470d4c	movsd	-0x20(%rbp), %xmm1
0000000000470d51	addsd	%xmm0, %xmm1
0000000000470d55	addsd	-0x18(%rbp), %xmm0
0000000000470d5a	movsd	0x29d426(%rip), %xmm2
0000000000470d62	movsd	-0x10(%rbp), %xmm3
0000000000470d67	addsd	%xmm2, %xmm3
0000000000470d6b	addsd	-0x8(%rbp), %xmm2
0000000000470d70	movsd	0x296158(%rip), %xmm4
0000000000470d78	movapd	%xmm1, %xmm5
0000000000470d7c	addsd	%xmm4, %xmm5
0000000000470d80	roundsd	$0x9, %xmm5, %xmm5
0000000000470d86	cvttsd2si	%xmm5, %edi
0000000000470d8a	addsd	%xmm0, %xmm4
0000000000470d8e	roundsd	$0x9, %xmm4, %xmm4
0000000000470d94	cvttsd2si	%xmm4, %esi
0000000000470d98	addsd	%xmm1, %xmm3
0000000000470d9c	xorps	%xmm1, %xmm1
0000000000470d9f	roundsd	$0xa, %xmm3, %xmm1
0000000000470da5	cvttsd2si	%xmm1, %edx
0000000000470da9	addsd	%xmm0, %xmm2
0000000000470dad	xorps	%xmm0, %xmm0
0000000000470db0	roundsd	$0xa, %xmm2, %xmm0
0000000000470db6	cvttsd2si	%xmm0, %ecx
0000000000470dba	callq	0x6dcca8                        ## symbol stub for: _HGRectMake4i
0000000000470dbf	addq	$0x20, %rsp
0000000000470dc3	popq	%rbp
0000000000470dc4	retq
0000000000470dc5	movq	0x3aff54(%rip), %rcx            ## literal pool symbol address: _HGRectNull
0000000000470dcc	movq	(%rcx), %rax
0000000000470dcf	movq	0x8(%rcx), %rdx
0000000000470dd3	addq	$0x20, %rsp
0000000000470dd7	popq	%rbp
0000000000470dd8	retq
0000000000470dd9	nopl	(%rax)
