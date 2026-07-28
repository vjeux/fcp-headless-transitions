__ZN17HgcColorIsolation6GetDODEP10HGRendereri6HGRect:
000000000145e1a0	pushq	%rbp
000000000145e1a1	movq	%rsp, %rbp
000000000145e1a4	pushq	%r15
000000000145e1a6	pushq	%r14
000000000145e1a8	pushq	%r12
000000000145e1aa	pushq	%rbx
000000000145e1ab	cmpl	$0x1, %edx
000000000145e1ae	je	0x145e1b6
000000000145e1b0	testl	%edx, %edx
000000000145e1b2	je	0x145e20b
000000000145e1b4	jmp	0x145e1fd
000000000145e1b6	movq	%rsi, %rbx
000000000145e1b9	movq	%rdi, %r14
000000000145e1bc	movq	%rsi, %rdi
000000000145e1bf	movq	%r14, %rsi
000000000145e1c2	movl	$0x1, %edx
000000000145e1c7	movq	%r8, %r15
000000000145e1ca	movq	%rcx, %r12
000000000145e1cd	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
000000000145e1d2	movq	%rbx, %rdi
000000000145e1d5	movq	%rax, %rsi
000000000145e1d8	callq	0x1495e92                       ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
000000000145e1dd	movq	%rdx, %rcx
000000000145e1e0	movq	%r12, %rdi
000000000145e1e3	movq	%r15, %rsi
000000000145e1e6	movq	%rax, %rdx
000000000145e1e9	callq	0x1495688                       ## symbol stub for: _HGRectIntersection
000000000145e1ee	movq	%rax, %rdi
000000000145e1f1	movq	%rdx, %rsi
000000000145e1f4	callq	0x149568e                       ## symbol stub for: _HGRectIsNull
000000000145e1f9	testl	%eax, %eax
000000000145e1fb	je	0x145e21a
000000000145e1fd	movq	0x48c06c(%rip), %rax            ## literal pool symbol address: _HGRectNull
000000000145e204	movq	(%rax), %rcx
000000000145e207	movq	0x8(%rax), %r8
000000000145e20b	movq	%rcx, %rax
000000000145e20e	movq	%r8, %rdx
000000000145e211	popq	%rbx
000000000145e212	popq	%r12
000000000145e214	popq	%r14
000000000145e216	popq	%r15
000000000145e218	popq	%rbp
000000000145e219	retq
000000000145e21a	movq	%rbx, %rdi
000000000145e21d	movq	%r14, %rsi
000000000145e220	xorl	%edx, %edx
000000000145e222	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
000000000145e227	movq	%rbx, %rdi
000000000145e22a	movq	%rax, %rsi
000000000145e22d	callq	0x1495e92                       ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
000000000145e232	movq	0x48c037(%rip), %rcx            ## literal pool symbol address: _HGRectNull
000000000145e239	movq	(%rcx), %r8
000000000145e23c	movq	0x8(%rcx), %rcx
000000000145e240	movq	%rax, %rdi
000000000145e243	movq	%rdx, %rsi
000000000145e246	movq	%r8, %rdx
000000000145e249	popq	%rbx
000000000145e24a	popq	%r12
000000000145e24c	popq	%r14
000000000145e24e	popq	%r15
000000000145e250	popq	%rbp
000000000145e251	jmp	0x14956a6                       ## symbol stub for: _HGRectUnion
000000000145e256	nopw	%cs:(%rax,%rax)
