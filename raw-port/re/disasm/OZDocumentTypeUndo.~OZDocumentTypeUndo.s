__ZN18OZDocumentTypeUndoD0Ev:
0000000000102a80	pushq	%rbp
0000000000102a81	movq	%rsp, %rbp
0000000000102a84	pushq	%r15
0000000000102a86	pushq	%r14
0000000000102a88	pushq	%rbx
0000000000102a89	pushq	%rax
0000000000102a8a	movq	%rdi, %rbx
0000000000102a8d	leaq	0x73ac84(%rip), %rax
0000000000102a94	movq	%rax, (%rdi)
0000000000102a97	movq	0x30(%rdi), %r15
0000000000102a9b	testq	%r15, %r15
0000000000102a9e	je	0x102ad1
0000000000102aa0	movq	0x38(%rbx), %r14
0000000000102aa4	movq	%r15, %rdi
0000000000102aa7	cmpq	%r14, %r15
0000000000102aaa	je	0x102ac8
0000000000102aac	nopl	(%rax)
0000000000102ab0	addq	$-0xe0, %r14
0000000000102ab7	movq	%r14, %rdi
0000000000102aba	callq	__ZN24OZDropZoneTypeUndoParamsD2Ev ## OZDropZoneTypeUndoParams::~OZDropZoneTypeUndoParams()
0000000000102abf	cmpq	%r15, %r14
0000000000102ac2	jne	0x102ab0
0000000000102ac4	movq	0x30(%rbx), %rdi
0000000000102ac8	movq	%r15, 0x38(%rbx)
0000000000102acc	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000102ad1	movq	0x18(%rbx), %rdi
0000000000102ad5	testq	%rdi, %rdi
0000000000102ad8	je	0x102ae3
0000000000102ada	movq	%rdi, 0x20(%rbx)
0000000000102ade	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000102ae3	movq	%rbx, %rdi
0000000000102ae6	addq	$0x8, %rsp
0000000000102aea	popq	%rbx
0000000000102aeb	popq	%r14
0000000000102aed	popq	%r15
0000000000102aef	popq	%rbp
0000000000102af0	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000102af5	nopw	%cs:(%rax,%rax)
