__ZN10HGProfiler10getTimeSecEv:
00000000001c3e20	pushq	%rbp
00000000001c3e21	movq	%rsp, %rbp
00000000001c3e24	movq	0x8(%rdi), %rax
00000000001c3e28	testq	%rax, %rax
00000000001c3e2b	js	0x1c3e34
00000000001c3e2d	cvtsi2ss	%rax, %xmm0
00000000001c3e32	jmp	0x1c3e49
00000000001c3e34	movq	%rax, %rcx
00000000001c3e37	shrq	%rcx
00000000001c3e3a	andl	$0x1, %eax
00000000001c3e3d	orq	%rcx, %rax
00000000001c3e40	cvtsi2ss	%rax, %xmm0
00000000001c3e45	addss	%xmm0, %xmm0
00000000001c3e49	mulss	__ZN10HGProfiler7_tbfreqE(%rip), %xmm0 ## HGProfiler::_tbfreq
00000000001c3e51	cvtss2sd	%xmm0, %xmm0
00000000001c3e55	mulsd	0x69b033(%rip), %xmm0
00000000001c3e5d	popq	%rbp
00000000001c3e5e	retq
00000000001c3e5f	nop
