__ZN17ApplyReflectivityD0Ev:
00000000001e3590	pushq	%rbp
00000000001e3591	movq	%rsp, %rbp
00000000001e3594	pushq	%rbx
00000000001e3595	pushq	%rax
00000000001e3596	movq	%rdi, %rbx
00000000001e3599	leaq	0x65fea0(%rip), %rax
00000000001e35a0	movq	%rax, (%rdi)
00000000001e35a3	leaq	0x65fede(%rip), %rax
00000000001e35aa	movq	%rax, 0x20(%rdi)
00000000001e35ae	addq	$0x18, %rdi
00000000001e35b2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001e35b7	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000001e35be	addq	$0x10, %rax
00000000001e35c2	movq	%rax, 0x20(%rbx)
00000000001e35c6	movq	0x28(%rbx), %rdi
00000000001e35ca	testq	%rdi, %rdi
00000000001e35cd	je	0x1e35d4
00000000001e35cf	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000001e35d4	movq	%rbx, %rdi
00000000001e35d7	addq	$0x8, %rsp
00000000001e35db	popq	%rbx
00000000001e35dc	popq	%rbp
00000000001e35dd	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001e35e2	movq	%rax, %rdi
00000000001e35e5	callq	___clang_call_terminate
00000000001e35ea	nopw	(%rax,%rax)
