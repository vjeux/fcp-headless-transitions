__ZN11HWrapRepeat6GetROIEP10HGRendereri6HGRect:
00000000004707b0	pushq	%rbp
00000000004707b1	movq	%rsp, %rbp
00000000004707b4	subq	$0x20, %rsp
00000000004707b8	testl	%edx, %edx
00000000004707ba	jne	0x470875
00000000004707c0	movq	%rdi, %rsi
00000000004707c3	xorps	%xmm0, %xmm0
00000000004707c6	movaps	%xmm0, -0x20(%rbp)
00000000004707ca	movaps	0x294bef(%rip), %xmm0
00000000004707d1	movaps	%xmm0, -0x10(%rbp)
00000000004707d5	addq	$0x240, %rdi                    ## imm = 0x240
00000000004707dc	addq	$0x1a0, %rsi                    ## imm = 0x1A0
00000000004707e3	leaq	-0x20(%rbp), %rdx
00000000004707e7	callq	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_ ## bool PCMatrix44Tmpl<double>::transformRect<double>(PCRect<double> const&, PCRect<double>&) const
00000000004707ec	testb	%al, %al
00000000004707ee	je	0x470875
00000000004707f4	movsd	0x29d984(%rip), %xmm0
00000000004707fc	movsd	-0x20(%rbp), %xmm1
0000000000470801	addsd	%xmm0, %xmm1
0000000000470805	addsd	-0x18(%rbp), %xmm0
000000000047080a	movsd	0x29d976(%rip), %xmm2
0000000000470812	movsd	-0x10(%rbp), %xmm3
0000000000470817	addsd	%xmm2, %xmm3
000000000047081b	addsd	-0x8(%rbp), %xmm2
0000000000470820	movsd	0x2966a8(%rip), %xmm4
0000000000470828	movapd	%xmm1, %xmm5
000000000047082c	addsd	%xmm4, %xmm5
0000000000470830	roundsd	$0x9, %xmm5, %xmm5
0000000000470836	cvttsd2si	%xmm5, %edi
000000000047083a	addsd	%xmm0, %xmm4
000000000047083e	roundsd	$0x9, %xmm4, %xmm4
0000000000470844	cvttsd2si	%xmm4, %esi
0000000000470848	addsd	%xmm1, %xmm3
000000000047084c	xorps	%xmm1, %xmm1
000000000047084f	roundsd	$0xa, %xmm3, %xmm1
0000000000470855	cvttsd2si	%xmm1, %edx
0000000000470859	addsd	%xmm0, %xmm2
000000000047085d	xorps	%xmm0, %xmm0
0000000000470860	roundsd	$0xa, %xmm2, %xmm0
0000000000470866	cvttsd2si	%xmm0, %ecx
000000000047086a	callq	0x6dcca8                        ## symbol stub for: _HGRectMake4i
000000000047086f	addq	$0x20, %rsp
0000000000470873	popq	%rbp
0000000000470874	retq
0000000000470875	movq	0x3b04a4(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000047087c	movq	(%rcx), %rax
000000000047087f	movq	0x8(%rcx), %rdx
0000000000470883	addq	$0x20, %rsp
0000000000470887	popq	%rbp
0000000000470888	retq
0000000000470889	nopl	(%rax)
