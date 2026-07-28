__ZN10HGProfiler8_tb_initEv:
00000000001c3c50	cmpb	$0x1, __ZN10HGProfiler6_firstE(%rip) ## HGProfiler::_first
00000000001c3c57	jne	0x1c3c9f
00000000001c3c59	pushq	%rbp
00000000001c3c5a	movq	%rsp, %rbp
00000000001c3c5d	leaq	__ZZN10HGProfiler8_tb_initEvE8s_tbinfo(%rip), %rdi ## HGProfiler::_tb_init()::s_tbinfo
00000000001c3c64	callq	0x3c5420                        ## symbol stub for: _mach_timebase_info
00000000001c3c69	movl	__ZZN10HGProfiler8_tb_initEvE8s_tbinfo(%rip), %eax ## HGProfiler::_tb_init()::s_tbinfo
00000000001c3c6f	cvtsi2sd	%rax, %xmm0
00000000001c3c74	mulsd	0x696ea4(%rip), %xmm0
00000000001c3c7c	movl	0x91a732(%rip), %eax
00000000001c3c82	cvtsi2sd	%rax, %xmm1
00000000001c3c87	divsd	%xmm1, %xmm0
00000000001c3c8b	cvtsd2ss	%xmm0, %xmm0
00000000001c3c8f	movss	%xmm0, __ZN10HGProfiler7_tbfreqE(%rip) ## HGProfiler::_tbfreq
00000000001c3c97	movb	$0x0, __ZN10HGProfiler6_firstE(%rip) ## HGProfiler::_first
00000000001c3c9e	popq	%rbp
00000000001c3c9f	retq
