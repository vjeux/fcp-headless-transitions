__ZN10HGProfiler4stopEv:
00000000001c3db0	pushq	%rbp
00000000001c3db1	movq	%rsp, %rbp
00000000001c3db4	pushq	%rbx
00000000001c3db5	pushq	%rax
00000000001c3db6	movq	%rdi, %rbx
00000000001c3db9	callq	0x3c540e                        ## symbol stub for: _mach_absolute_time
00000000001c3dbe	subq	(%rbx), %rax
00000000001c3dc1	addq	%rax, 0x8(%rbx)
00000000001c3dc5	addq	$0x8, %rsp
00000000001c3dc9	popq	%rbx
00000000001c3dca	popq	%rbp
00000000001c3dcb	retq
00000000001c3dcc	nopl	(%rax)
