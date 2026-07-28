__ZN17OZStringTablesMap11getInstanceEv:
00000000000636b8	pushq	%rbp
00000000000636b9	movq	%rsp, %rbp
00000000000636bc	pushq	%r14
00000000000636be	pushq	%rbx
00000000000636bf	movq	__ZN17OZStringTablesMap17_sStringTablesMapE(%rip), %rbx ## OZStringTablesMap::_sStringTablesMap
00000000000636c6	testq	%rbx, %rbx
00000000000636c9	jne	0x636e7
00000000000636cb	movl	$0x88, %edi
00000000000636d0	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000636d5	movq	%rax, %rbx
00000000000636d8	movq	%rax, %rdi
00000000000636db	callq	__ZN17OZStringTablesMapC2Ev     ## OZStringTablesMap::OZStringTablesMap()
00000000000636e0	movq	%rbx, __ZN17OZStringTablesMap17_sStringTablesMapE(%rip) ## OZStringTablesMap::_sStringTablesMap
00000000000636e7	movq	%rbx, %rax
00000000000636ea	popq	%rbx
00000000000636eb	popq	%r14
00000000000636ed	popq	%rbp
00000000000636ee	retq
00000000000636ef	movq	%rax, %r14
00000000000636f2	movq	%rbx, %rdi
00000000000636f5	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000636fa	movq	%r14, %rdi
00000000000636fd	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
