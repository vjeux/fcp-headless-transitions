__ZNK17HGParamBufferDesc26printParamValuesFromBufferEPhm:
0000000000001510	pushq	%rbp
0000000000001511	movq	%rsp, %rbp
0000000000001514	pushq	%r15
0000000000001516	pushq	%r14
0000000000001518	pushq	%r13
000000000000151a	pushq	%r12
000000000000151c	pushq	%rbx
000000000000151d	subq	$0x28, %rsp
0000000000001521	movq	%rdx, -0x30(%rbp)
0000000000001525	movq	%rdi, %rbx
0000000000001528	xorps	%xmm0, %xmm0
000000000000152b	movups	%xmm0, (%rdi)
000000000000152e	movq	$0x0, 0x10(%rdi)
0000000000001536	cmpq	%rcx, 0x28(%rsi)
000000000000153a	jne	0x15f6
0000000000001540	movq	%rsi, %r12
0000000000001543	movq	0x10(%rsi), %rax
0000000000001547	cmpq	%rax, 0x18(%rsi)
000000000000154b	je	0x1605
0000000000001551	movq	%rcx, %r14
0000000000001554	addq	-0x30(%rbp), %r14
0000000000001558	xorl	%r15d, %r15d
000000000000155b	jmp	0x157d
000000000000155d	nopl	(%rax)
0000000000001560	incq	%r15
0000000000001563	movq	0x10(%r12), %rax
0000000000001568	movq	0x18(%r12), %rcx
000000000000156d	subq	%rax, %rcx
0000000000001570	sarq	$0x3, %rcx
0000000000001574	cmpq	%r15, %rcx
0000000000001577	jbe	0x1605
000000000000157d	movq	(%rax,%r15,8), %rdi
0000000000001581	callq	__ZNK12HGParamField11fieldOffsetEv ## HGParamField::fieldOffset() const
0000000000001586	movq	%rax, %r13
0000000000001589	movq	0x10(%r12), %rax
000000000000158e	movq	(%rax,%r15,8), %rdi
0000000000001592	callq	__ZNK12HGParamField9fieldSizeEv ## HGParamField::fieldSize() const
0000000000001597	addq	-0x30(%rbp), %r13
000000000000159b	addq	%r13, %rax
000000000000159e	cmpq	%r14, %rax
00000000000015a1	ja	0x1605
00000000000015a3	movq	0x10(%r12), %rax
00000000000015a8	movq	(%rax,%r15,8), %rsi
00000000000015ac	movq	(%rsi), %rax
00000000000015af	leaq	-0x48(%rbp), %rdi
00000000000015b3	movq	%r13, %rdx
00000000000015b6	callq	*0x28(%rax)
00000000000015b9	movzbl	-0x48(%rbp), %edx
00000000000015bd	testb	$0x1, %dl
00000000000015c0	je	0x15d0
00000000000015c2	movq	-0x38(%rbp), %rsi
00000000000015c6	movq	-0x40(%rbp), %rdx
00000000000015ca	jmp	0x15d6
00000000000015cc	nopl	(%rax)
00000000000015d0	shrl	%edx
00000000000015d2	leaq	-0x47(%rbp), %rsi
00000000000015d6	movq	%rbx, %rdi
00000000000015d9	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000000015de	testb	$0x1, -0x48(%rbp)
00000000000015e2	je	0x1560
00000000000015e8	movq	-0x38(%rbp), %rdi
00000000000015ec	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000015f1	jmp	0x1560
00000000000015f6	leaq	0x8b3ba3(%rip), %rsi            ## literal pool for: " paramBufferData and ParamBufferDesc.size() does not match, Aborting logging param values\n"
00000000000015fd	movq	%rbx, %rdi
0000000000001600	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000001605	movq	%rbx, %rax
0000000000001608	addq	$0x28, %rsp
000000000000160c	popq	%rbx
000000000000160d	popq	%r12
000000000000160f	popq	%r13
0000000000001611	popq	%r14
0000000000001613	popq	%r15
0000000000001615	popq	%rbp
0000000000001616	retq
0000000000001617	movq	%rax, %r14
000000000000161a	testb	$0x1, (%rbx)
000000000000161d	je	0x162f
000000000000161f	jmp	0x1659
0000000000001621	movq	%rax, %r14
0000000000001624	testb	$0x1, -0x48(%rbp)
0000000000001628	jne	0x1637
000000000000162a	testb	$0x1, (%rbx)
000000000000162d	jne	0x1659
000000000000162f	movq	%r14, %rdi
0000000000001632	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000001637	movq	-0x38(%rbp), %rdi
000000000000163b	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000001640	testb	$0x1, (%rbx)
0000000000001643	je	0x162f
0000000000001645	jmp	0x1659
0000000000001647	movq	%rax, %r14
000000000000164a	testb	$0x1, (%rbx)
000000000000164d	je	0x162f
000000000000164f	jmp	0x1659
0000000000001651	movq	%rax, %r14
0000000000001654	testb	$0x1, (%rbx)
0000000000001657	je	0x162f
0000000000001659	movq	0x10(%rbx), %rdi
000000000000165d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000001662	movq	%r14, %rdi
0000000000001665	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000000166a	nopw	(%rax,%rax)
