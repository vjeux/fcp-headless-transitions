__ZN10HGProfilerC1Ev:
00000000001c3d20	pushq	%rbp
00000000001c3d21	movq	%rsp, %rbp
00000000001c3d24	pushq	%rbx
00000000001c3d25	pushq	%rax
00000000001c3d26	movq	%rdi, %rbx
00000000001c3d29	cmpb	$0x1, __ZN10HGProfiler6_firstE(%rip) ## HGProfiler::_first
00000000001c3d30	jne	0x1c3d73
00000000001c3d32	leaq	__ZZN10HGProfiler8_tb_initEvE8s_tbinfo(%rip), %rdi ## HGProfiler::_tb_init()::s_tbinfo
00000000001c3d39	callq	0x3c5420                        ## symbol stub for: _mach_timebase_info
00000000001c3d3e	movl	__ZZN10HGProfiler8_tb_initEvE8s_tbinfo(%rip), %eax ## HGProfiler::_tb_init()::s_tbinfo
00000000001c3d44	cvtsi2sd	%rax, %xmm0
00000000001c3d49	mulsd	0x696dcf(%rip), %xmm0
00000000001c3d51	movl	0x91a65d(%rip), %eax
00000000001c3d57	cvtsi2sd	%rax, %xmm1
00000000001c3d5c	divsd	%xmm1, %xmm0
00000000001c3d60	cvtsd2ss	%xmm0, %xmm0
00000000001c3d64	movss	%xmm0, __ZN10HGProfiler7_tbfreqE(%rip) ## HGProfiler::_tbfreq
00000000001c3d6c	movb	$0x0, __ZN10HGProfiler6_firstE(%rip) ## HGProfiler::_first
00000000001c3d73	movq	$0x0, 0x8(%rbx)
00000000001c3d7b	addq	$0x8, %rsp
00000000001c3d7f	popq	%rbx
00000000001c3d80	popq	%rbp
00000000001c3d81	retq
00000000001c3d82	nopw	%cs:(%rax,%rax)
