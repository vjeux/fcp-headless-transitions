__ZN17ApplyReflectivityC1Ei:
00000000001e1760	pushq	%rbp
00000000001e1761	movq	%rsp, %rbp
00000000001e1764	pushq	%r15
00000000001e1766	pushq	%r14
00000000001e1768	pushq	%rbx
00000000001e1769	pushq	%rax
00000000001e176a	movl	%esi, %r15d
00000000001e176d	movq	%rdi, %r14
00000000001e1770	leaq	0x20(%rdi), %rbx
00000000001e1774	movq	$0x0, 0x28(%rdi)
00000000001e177c	leaq	0x661cbd(%rip), %rax
00000000001e1783	movq	%rax, (%rdi)
00000000001e1786	leaq	0x661cfb(%rip), %rax
00000000001e178d	movq	%rax, 0x20(%rdi)
00000000001e1791	movl	%esi, %edi
00000000001e1793	callq	__ZL19setUpFinishUniformsi      ## setUpFinishUniforms(int)
00000000001e1798	movslq	%r15d, %rax
00000000001e179b	movq	__ZL14finishUniforms(%rip), %rcx ## finishUniforms
00000000001e17a2	shlq	$0x4, %rax
00000000001e17a6	movq	(%rcx,%rax), %rax
00000000001e17aa	addq	$0x20, %rax
00000000001e17ae	movq	%rax, 0x8(%r14)
00000000001e17b2	movq	$0x0, 0x10(%r14)
00000000001e17ba	addq	$0x18, %r14
00000000001e17be	movq	%r14, %rdi
00000000001e17c1	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000001e17c6	addq	$0x8, %rsp
00000000001e17ca	popq	%rbx
00000000001e17cb	popq	%r14
00000000001e17cd	popq	%r15
00000000001e17cf	popq	%rbp
00000000001e17d0	retq
00000000001e17d1	movq	%rax, %r14
00000000001e17d4	movq	%rbx, %rdi
00000000001e17d7	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000001e17dc	movq	%r14, %rdi
00000000001e17df	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e17e4	nopw	%cs:(%rax,%rax)
