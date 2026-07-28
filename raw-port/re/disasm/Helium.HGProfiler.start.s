__ZN10HGProfiler5startEv:
00000000001c3d90	pushq	%rbp
00000000001c3d91	movq	%rsp, %rbp
00000000001c3d94	pushq	%rbx
00000000001c3d95	pushq	%rax
00000000001c3d96	movq	%rdi, %rbx
00000000001c3d99	callq	0x3c540e                        ## symbol stub for: _mach_absolute_time
00000000001c3d9e	movq	%rax, (%rbx)
00000000001c3da1	addq	$0x8, %rsp
00000000001c3da5	popq	%rbx
00000000001c3da6	popq	%rbp
00000000001c3da7	retq
00000000001c3da8	nopl	(%rax,%rax)
