__ZN17HgcColorIsolation6GetROIEP10HGRendereri6HGRect:
000000000145e260	cmpl	$0x1, %edx
000000000145e263	je	0x145e27e
000000000145e265	testl	%edx, %edx
000000000145e267	je	0x145e277
000000000145e269	movq	0x48c000(%rip), %rax            ## literal pool symbol address: _HGRectNull
000000000145e270	movq	(%rax), %rcx
000000000145e273	movq	0x8(%rax), %r8
000000000145e277	movq	%rcx, %rax
000000000145e27a	movq	%r8, %rdx
000000000145e27d	retq
000000000145e27e	pushq	%rbp
000000000145e27f	movq	%rsp, %rbp
000000000145e282	pushq	%rbx
000000000145e283	pushq	%rax
000000000145e284	movq	%rdi, %rax
000000000145e287	movq	%rsi, %rdi
000000000145e28a	movq	%rsi, %rbx
000000000145e28d	movq	%rax, %rsi
000000000145e290	movl	$0x1, %edx
000000000145e295	callq	0x1495e9e                       ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
000000000145e29a	movq	%rbx, %rdi
000000000145e29d	movq	%rax, %rsi
000000000145e2a0	addq	$0x8, %rsp
000000000145e2a4	popq	%rbx
000000000145e2a5	popq	%rbp
000000000145e2a6	jmp	0x1495e92                       ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
000000000145e2ab	nopl	(%rax,%rax)
